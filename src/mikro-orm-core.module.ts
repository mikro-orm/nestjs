import { EntityManager, MikroORM } from '@mikro-orm/core';
import type { DynamicModule, MiddlewareConsumer, OnApplicationShutdown, Type } from '@nestjs/common';
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

enum EntityManagerModuleName {
  Knex = '@mikro-orm/knex',
  MongoDb = '@mikro-orm/mongodb',
}

type SqlEntityManagerExportObj = { SqlEntityManager: Type<EntityManager> };
type MongoEntityManagerExportObj = { MongoEntityManager: Type<EntityManager> };

type EntityManagerExportObj<TModuleName extends EntityManagerModuleName> =
  TModuleName extends EntityManagerModuleName.Knex ? SqlEntityManagerExportObj :
    TModuleName extends EntityManagerModuleName.MongoDb ? MongoEntityManagerExportObj :
      never;

// https://github.com/krzkaczor/ts-essentials/blob/d9034549ec1b3a72bf3f335fc54724349356dd7c/lib/types.ts
type AsyncOrSync<T> = PromiseLike<T> | T;
type Awaited<T> = T extends PromiseLike<infer PT> ? PT : never;

async function whenModuleAvailable<
  TModuleName extends EntityManagerModuleName,
  TReturnValue,
>(moduleName: TModuleName, returnFn: (module: EntityManagerExportObj<TModuleName>) => AsyncOrSync<TReturnValue>): Promise<[Awaited<TReturnValue>] | []> {
  try {
    const module = await import(moduleName);
    // TReturnValue may be incorrect if expecting it to extend Promise<T> since its being awaited in the return
    // casting to Awaited<TReturnValue> to satisfy the return type will prevent that confusion
    return [await returnFn(module) as Awaited<TReturnValue>];
  } catch (err) {
    return [];
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
    return {
      module: MikroOrmCoreModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
        createMikroOrmProvider(contextName),
        createMikroOrmEntityManagerProvider(options?.scope, EntityManager, contextName),
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ({ SqlEntityManager })  => createMikroOrmEntityManagerProvider(options?.scope, SqlEntityManager, contextName, getSqlEntityManagerToken(contextName)))),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ({ MongoEntityManager })  => createMikroOrmEntityManagerProvider(options?.scope, MongoEntityManager, contextName, getMongoEntityManagerToken(contextName)))),
      ],
      exports: [
        contextName ? getMikroORMToken(contextName) : MikroORM,
        contextName ? getEntityManagerToken(contextName) : EntityManager,
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ({ SqlEntityManager })  => contextName ? getSqlEntityManagerToken(contextName) : SqlEntityManager)),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ({ MongoEntityManager })  => contextName ? getMongoEntityManagerToken(contextName) : MongoEntityManager)),
      ],
    };
  }

  static async forRootAsync(options: MikroOrmModuleAsyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options?.contextName);
    return {
      module: MikroOrmCoreModule,
      imports: options.imports || [],
      providers: [
        ...(options.providers || []),
        ...createAsyncProviders({ ...options, contextName: options.contextName }),
        createMikroOrmProvider(contextName),
        createMikroOrmEntityManagerProvider(options.scope, EntityManager, contextName),
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ({ SqlEntityManager })  => createMikroOrmEntityManagerProvider(options.scope, SqlEntityManager, contextName, getSqlEntityManagerToken(contextName)))),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ({ MongoEntityManager })  => createMikroOrmEntityManagerProvider(options.scope, MongoEntityManager, contextName, getMongoEntityManagerToken(contextName)))),
      ],
      exports: [
        contextName ? getMikroORMToken(contextName) : MikroORM,
        contextName ? getEntityManagerToken(contextName) : EntityManager,
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ({ SqlEntityManager })  => contextName ? getSqlEntityManagerToken(contextName) : SqlEntityManager)),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ({ MongoEntityManager })  => contextName ? getMongoEntityManagerToken(contextName) : MongoEntityManager)),
      ],
    };
  }

  async onApplicationShutdown() {
    const token = this.options.contextName ? getMikroORMToken(this.options.contextName) : MikroORM;
    const orm = this.moduleRef.get(token);

    if (orm) {
      await orm.close();
    }

    CONTEXT_NAMES.splice(0,CONTEXT_NAMES.length);
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
