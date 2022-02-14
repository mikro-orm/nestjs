import { EntityManager, MikroORM } from '@mikro-orm/core';
import type { DynamicModule, MiddlewareConsumer, OnApplicationShutdown, Type } from '@nestjs/common';
import { Global, Inject, Module, RequestMethod } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import { MikroOrmMiddleware } from './mikro-orm.middleware';
import { createAsyncProviders, createMikroOrmEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers';
import type { MikroOrmModuleAsyncOptions, MikroOrmModuleSyncOptions, NestMiddlewareConsumer } from './typings';
import { MikroOrmModuleOptions } from './typings';

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
    return {
      module: MikroOrmCoreModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
        createMikroOrmProvider(),
        createMikroOrmEntityManagerProvider(options?.scope),
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ({ SqlEntityManager })  => createMikroOrmEntityManagerProvider(options?.scope, SqlEntityManager))),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ({ MongoEntityManager })  => createMikroOrmEntityManagerProvider(options?.scope, MongoEntityManager))),
      ],
      exports: [
        MikroORM,
        EntityManager,
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ({ SqlEntityManager })  => SqlEntityManager)),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ({ MongoEntityManager })  => MongoEntityManager)),
      ],
    };
  }

  static async forRootAsync(options: MikroOrmModuleAsyncOptions): Promise<DynamicModule> {
    return {
      module: MikroOrmCoreModule,
      imports: options.imports || [],
      providers: [
        ...(options.providers || []),
        ...createAsyncProviders(options),
        createMikroOrmProvider(),
        createMikroOrmEntityManagerProvider(options.scope),
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ({ SqlEntityManager })  => createMikroOrmEntityManagerProvider(options.scope, SqlEntityManager))),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ({ MongoEntityManager })  => createMikroOrmEntityManagerProvider(options.scope, MongoEntityManager))),
      ],
      exports: [
        MikroORM,
        EntityManager,
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ({ SqlEntityManager })  => SqlEntityManager)),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ({ MongoEntityManager })  => MongoEntityManager)),
      ],
    };
  }

  async onApplicationShutdown() {
    const orm = this.moduleRef.get(MikroORM);

    if (orm) {
      await orm.close();
    }
  }

  configure(consumer: MiddlewareConsumer): void {
    if (this.options.registerRequestContext === false) {
      return;
    }

    const isNestMiddleware = (consumer: MiddlewareConsumer): consumer is NestMiddlewareConsumer => {
      return typeof (consumer as any).httpAdapter === 'object';
    };

    const usingFastify = (consumer: NestMiddlewareConsumer) => {
      return consumer.httpAdapter.constructor.name.toLowerCase().startsWith('fastify');
    };

    const forRoutesPath =
      this.options.forRoutesPath ??
      (isNestMiddleware(consumer) && usingFastify(consumer) ? '(.*)' : '*');

    consumer
      .apply(MikroOrmMiddleware) // register request context automatically
      .forRoutes({ path: forRoutesPath, method: RequestMethod.ALL });
  }

}
