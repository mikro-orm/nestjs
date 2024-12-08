import { Configuration, ConfigurationLoader, EntityManager, MikroORM, type Dictionary } from '@mikro-orm/core';
import {
  Global,
  Inject,
  Module,
  RequestMethod,
  type DynamicModule,
  type MiddlewareConsumer,
  type NestModule,
  type OnApplicationShutdown,
  type Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { forRoutesPath } from './middleware.helper';
import { CONTEXT_NAMES, getEntityManagerToken, getMikroORMToken, MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import { MikroOrmEntitiesStorage } from './mikro-orm.entities.storage';
import { MikroOrmMiddleware } from './mikro-orm.middleware';
import { createAsyncProviders, createEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers';
import { MikroOrmModuleOptions, type MikroOrmModuleAsyncOptions, type MikroOrmModuleSyncOptions } from './typings';

async function tryRequire(name: string): Promise<Dictionary | undefined> {
  try {
    return await import(name);
  } catch {
    return undefined; // ignore, optional dependency
  }
}

// TODO: provide the package name via some platform method, prefer that over the static map when available
const PACKAGES = {
  MongoDriver: '@mikro-orm/mongo',
  MySqlDriver: '@mikro-orm/mysql',
  MsSqlDriver: '@mikro-orm/mssql',
  MariaDbDriver: '@mikro-orm/mariadb',
  PostgreSqlDriver: '@mikro-orm/postgresql',
  SqliteDriver: '@mikro-orm/sqlite',
  LibSqlDriver: '@mikro-orm/libsql',
  BetterSqliteDriver: '@mikro-orm/better-sqlite',
} as const;

@Global()
@Module({})
export class MikroOrmCoreModule implements NestModule, OnApplicationShutdown {

  constructor(@Inject(MIKRO_ORM_MODULE_OPTIONS)
              private readonly options: MikroOrmModuleOptions,
              private readonly moduleRef: ModuleRef) { }

  static async forRoot(options?: MikroOrmModuleSyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options?.contextName);
    const knex = await tryRequire('@mikro-orm/knex');
    const mongo = await tryRequire('@mikro-orm/mongodb');
    const em = await this.createEntityManager(options);

    if (em && !contextName) {
      const packageName = PACKAGES[em.getDriver().constructor.name as keyof typeof PACKAGES];
      const driverPackage = await tryRequire(packageName);

      if (driverPackage) {
        return {
          module: MikroOrmCoreModule,
          providers: [
            { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
            createMikroOrmProvider(contextName),
            createMikroOrmProvider(contextName, driverPackage.MikroORM),
            createEntityManagerProvider(options?.scope, EntityManager),
            createEntityManagerProvider(options?.scope, driverPackage.EntityManager),
          ],
          exports: [
            MikroORM,
            EntityManager,
            driverPackage.EntityManager,
            driverPackage.MikroORM,
          ],
        };
      }
    }

    return {
      module: MikroOrmCoreModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
        createMikroOrmProvider(contextName),
        ...(mongo ? [createMikroOrmProvider(contextName, mongo.MikroORM)] : []),
        createEntityManagerProvider(options?.scope, EntityManager, contextName),
        ...(em ? [createEntityManagerProvider(options?.scope, em.constructor as Type, contextName)] : []),
        ...(knex ? [createEntityManagerProvider(options?.scope, knex.EntityManager, contextName)] : []),
        ...(mongo ? [createEntityManagerProvider(options?.scope, mongo.EntityManager, contextName)] : []),
      ],
      exports: [
        contextName ? getMikroORMToken(contextName) : MikroORM,
        contextName ? getEntityManagerToken(contextName) : EntityManager,
        ...(em && !contextName ? [em.constructor] : []),
        ...(knex && !contextName ? [knex.EntityManager] : []),
        ...(mongo && !contextName ? [mongo.EntityManager, mongo.MikroORM] : []),
      ],
    };
  }

  static async forRootAsync(options: MikroOrmModuleAsyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options?.contextName);
    const knex = await tryRequire('@mikro-orm/knex');
    const mongo = await tryRequire('@mikro-orm/mongodb');
    const em = await this.createEntityManager(options);

    if (em && !contextName) {
      const packageName = PACKAGES[em.getDriver().constructor.name as keyof typeof PACKAGES];
      const driverPackage = await tryRequire(packageName);

      if (driverPackage) {
        return {
          module: MikroOrmCoreModule,
          imports: options.imports || [],
          providers: [
            ...(options.providers || []),
            ...createAsyncProviders({ ...options, contextName: options.contextName }),
            createMikroOrmProvider(contextName),
            createMikroOrmProvider(contextName, driverPackage.MikroORM),
            createEntityManagerProvider(options?.scope, EntityManager),
            createEntityManagerProvider(options?.scope, driverPackage.EntityManager),
          ],
          exports: [
            MikroORM,
            EntityManager,
            driverPackage.EntityManager,
            driverPackage.MikroORM,
          ],
        };
      }
    }

    return {
      module: MikroOrmCoreModule,
      imports: options.imports || [],
      providers: [
        ...(options.providers || []),
        ...createAsyncProviders({ ...options, contextName: options.contextName }),
        createMikroOrmProvider(contextName),
        ...(mongo ? [createMikroOrmProvider(contextName, mongo.MikroORM)] : []),
        createEntityManagerProvider(options.scope, EntityManager, contextName),
        ...(em ? [createEntityManagerProvider(options?.scope, em.constructor as Type, contextName)] : []),
        ...(knex ? [createEntityManagerProvider(options?.scope, knex.EntityManager, contextName)] : []),
        ...(mongo ? [createEntityManagerProvider(options?.scope, mongo.EntityManager, contextName)] : []),
      ],
      exports: [
        contextName ? getMikroORMToken(contextName) : MikroORM,
        contextName ? getEntityManagerToken(contextName) : EntityManager,
        ...(em && !contextName ? [em.constructor] : []),
        ...(knex && !contextName ? [knex.EntityManager] : []),
        ...(mongo && !contextName ? [mongo.EntityManager, mongo.MikroORM] : []),
      ],
    };
  }

  /**
   * Tries to create the driver instance to use the actual entity manager implementation for DI symbol.
   * This helps with dependency resolution issues when importing the EM from driver package (e.g. `SqlEntityManager`).
   */
  private static async createEntityManager(options?: MikroOrmModuleSyncOptions | MikroOrmModuleAsyncOptions): Promise<any> {
    if (options?.contextName) {
      return undefined;
    }

    try {
      let config;

      if (!options || Object.keys(options).length === 0) {
        config = await ConfigurationLoader.getConfiguration(false);
      }

      if (!config && 'useFactory' in options!) {
        config = new Configuration(await options.useFactory!(), false);
      }

      if (!config && options instanceof Configuration) {
        config = options;
      }

      if (!config && typeof options === 'object' && options && 'driver' in options) {
        config = new Configuration(options, false);
      }

      return config?.getDriver().createEntityManager();
    } catch {
      // ignore
    }
  }

  async onApplicationShutdown() {
    const token = this.options.contextName ? getMikroORMToken(this.options.contextName) : MikroORM;
    const orm = this.moduleRef.get(token);

    if (orm) {
      await orm.close();
      MikroOrmEntitiesStorage.clearLater();
    }

    CONTEXT_NAMES.length = 0;
  }

  configure(consumer: MiddlewareConsumer): void {
    if (this.options.registerRequestContext === false) {
      return;
    }

    consumer
      .apply(MikroOrmMiddleware) // register request context automatically
      .forRoutes({ path: forRoutesPath(this.options, consumer), method: RequestMethod.ALL });
  }

  private static setContextName(contextName?: string) {
    if (!contextName) {
      return;
    }

    if (CONTEXT_NAMES.includes(contextName)) {
      throw new Error(`ContextName '${contextName}' already registered`);
    }

    CONTEXT_NAMES.push(contextName);

    return contextName;
  }

}
