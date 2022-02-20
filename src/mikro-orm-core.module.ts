import { EntityManager, MikroORM } from '@mikro-orm/core';
import type { DynamicModule, MiddlewareConsumer, ModuleMetadata, OnApplicationShutdown, Type } from '@nestjs/common';
import { Global, Inject, Module, RequestMethod } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  CONTEXT_NAMES,
  getEntityManagerToken,
  getMikroORMToken,
  getMongoEntityManagerToken,
  getSqlEntityManagerToken,
  MIKRO_ORM_MODULE_OPTIONS,
} from './mikro-orm.common';
import { createAsyncProviders, createMikroOrmEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers';
import type { MikroOrmModuleAsyncOptions, MikroOrmModuleSyncOptions } from './typings';
import { MikroOrmModuleOptions } from './typings';
import { MikroOrmMiddleware } from './mikro-orm.middleware';
import { forRoutesPath } from './middleware.helper';

const importMongoEntityManager = async () => {
  try {
    const module = await import('@mikro-orm/mongodb' as const);
    return module.EntityManager as Type<EntityManager>;
  } catch {
    return undefined;
  }
};

const importSqlEntityManager = async () => {
  try {
    const module = await import('@mikro-orm/knex' as const);
    return module.EntityManager as Type<EntityManager>;
  } catch {
    return undefined;
  }
};

@Global()
@Module({})
export class MikroOrmCoreModule implements OnApplicationShutdown {

  constructor(@Inject(MIKRO_ORM_MODULE_OPTIONS)
              private readonly options: MikroOrmModuleOptions,
              private readonly moduleRef: ModuleRef) { }

  static async forRoot(options?: MikroOrmModuleSyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options?.contextName);

    const SqlEntityManager = await importSqlEntityManager();
    const MongoEntityManager = await importMongoEntityManager();

    const providers: ModuleMetadata['providers'] = [
      { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
      createMikroOrmProvider(contextName),
      createMikroOrmEntityManagerProvider(options?.scope, EntityManager, contextName),
    ];

    const exports: ModuleMetadata['exports'] = [
      contextName ? getMikroORMToken(contextName) : MikroORM,
      contextName ? getEntityManagerToken(contextName) : EntityManager,
    ];

    if (SqlEntityManager) {
      providers.push(createMikroOrmEntityManagerProvider(options?.scope, contextName ? getSqlEntityManagerToken(contextName) : SqlEntityManager, contextName));
      exports.push(contextName ? getSqlEntityManagerToken(contextName) : SqlEntityManager);
    }

    if (MongoEntityManager) {
      providers.push(createMikroOrmEntityManagerProvider(options?.scope, contextName ? getMongoEntityManagerToken(contextName) : MongoEntityManager, contextName));
      exports.push(contextName ? getMongoEntityManagerToken(contextName) : MongoEntityManager);
    }

    return {
      module: MikroOrmCoreModule,
      providers,
      exports,
    };
  }

  static async forRootAsync(options: MikroOrmModuleAsyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options?.contextName);

    const SqlEntityManager = await importSqlEntityManager();
    const MongoEntityManager = await importMongoEntityManager();

    const providers: ModuleMetadata['providers'] = [
      ...(options.providers || []),
      ...createAsyncProviders({ ...options, contextName: options.contextName }),
      createMikroOrmProvider(contextName),
      createMikroOrmEntityManagerProvider(options.scope, EntityManager, contextName),
    ];

    const exports: ModuleMetadata['exports'] = [
      contextName ? getMikroORMToken(contextName) : MikroORM,
      contextName ? getEntityManagerToken(contextName) : EntityManager,
    ];

    if (SqlEntityManager) {
      providers.push(createMikroOrmEntityManagerProvider(options?.scope, contextName ? getSqlEntityManagerToken(contextName) : SqlEntityManager, contextName));
      exports.push(contextName ? getSqlEntityManagerToken(contextName) : SqlEntityManager);
    }

    if (MongoEntityManager) {
      providers.push(createMikroOrmEntityManagerProvider(options?.scope, contextName ? getMongoEntityManagerToken(contextName) : MongoEntityManager, contextName));
      exports.push(contextName ? getMongoEntityManagerToken(contextName) : MongoEntityManager);
    }

    return {
      module: MikroOrmCoreModule,
      imports: options.imports || [],
      providers,
      exports,
    };
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
