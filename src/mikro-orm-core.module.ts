import type { Dictionary } from '@mikro-orm/core';
import { Configuration, ConfigurationLoader, EntityManager, MikroORM } from '@mikro-orm/core';
import type { DynamicModule, MiddlewareConsumer, OnApplicationShutdown, Type } from '@nestjs/common';
import { Global, Inject, Module, RequestMethod } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { CONTEXT_NAMES, getEntityManagerToken, getMikroORMToken, MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import { createAsyncProviders, createEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers';
import type { MikroOrmModuleAsyncOptions, MikroOrmModuleSyncOptions } from './typings';
import { MikroOrmModuleOptions } from './typings';
import { MikroOrmMiddleware } from './mikro-orm.middleware';
import { forRoutesPath } from './middleware.helper';

async function tryRequire(name: string): Promise<Dictionary | undefined> {
  try {
    return await import(name);
  } catch {
    return undefined; // ignore, optional dependency
  }
}

@Global()
@Module({})
export class MikroOrmCoreModule implements OnApplicationShutdown {

  constructor(@Inject(MIKRO_ORM_MODULE_OPTIONS)
              private readonly options: MikroOrmModuleOptions,
              private readonly moduleRef: ModuleRef) { }

  static async forRoot(options?: MikroOrmModuleSyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options?.contextName);
    const knex = await tryRequire('@mikro-orm/knex');
    const mongo = await tryRequire('@mikro-orm/mongodb');
    const em = await this.createEntityManager(options);

    return {
      module: MikroOrmCoreModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
        createMikroOrmProvider(contextName),
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
        ...(mongo && !contextName ? [mongo.EntityManager] : []),
      ],
    };
  }

  static async forRootAsync(options: MikroOrmModuleAsyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options?.contextName);
    const knex = await tryRequire('@mikro-orm/knex');
    const mongo = await tryRequire('@mikro-orm/mongodb');
    const em = await this.createEntityManager(options);

    return {
      module: MikroOrmCoreModule,
      imports: options.imports || [],
      providers: [
        ...(options.providers || []),
        ...createAsyncProviders({ ...options, contextName: options.contextName }),
        createMikroOrmProvider(contextName),
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
        ...(mongo && !contextName ? [mongo.EntityManager] : []),
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
      if (!options || Object.keys(options).length === 0) {
        const config = await ConfigurationLoader.getConfiguration(false);
        return config.getDriver().createEntityManager();
      }

      if ('useFactory' in options) {
        const config = new Configuration(options.useFactory!(), false);
        return config.getDriver().createEntityManager();
      }
    } catch {
      // ignore
    }
  }

  async onApplicationShutdown() {
    const token = this.options.contextName ? getMikroORMToken(this.options.contextName) : MikroORM;
    const orm = this.moduleRef.get(token);

    if (orm) {
      await orm.close();
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
