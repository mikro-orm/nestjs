import { EntityManager, MikroORM, Options } from '@mikro-orm/core';
import { DynamicModule, Global, Inject, MiddlewareConsumer, Module, OnApplicationShutdown, RequestMethod } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import { MikroOrmMiddleware } from './mikro-orm.middleware';
import { createAsyncProviders, createMikroOrmEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers';
import { MikroOrmModuleAsyncOptions, MikroOrmModuleOptions, NestMiddlewareConsumer } from './typings';

@Global()
@Module({})
export class MikroOrmCoreModule implements OnApplicationShutdown {

  constructor(@Inject(MIKRO_ORM_MODULE_OPTIONS)
              private readonly options: MikroOrmModuleOptions,
              private readonly moduleRef: ModuleRef) { }

  static forRoot(options?: Options): DynamicModule {
    return {
      module: MikroOrmCoreModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
        createMikroOrmProvider(),
        createMikroOrmEntityManagerProvider(),
        createMikroOrmEntityManagerProvider('SqlEntityManager'),
        createMikroOrmEntityManagerProvider('MongoEntityManager'),
      ],
      exports: [MikroORM, EntityManager, 'SqlEntityManager', 'MongoEntityManager'],
    };
  }

  static forRootAsync(options: MikroOrmModuleAsyncOptions): DynamicModule {
    return {
      module: MikroOrmCoreModule,
      imports: options.imports || [],
      providers: [
        ...(options.providers || []),
        ...createAsyncProviders(options),
        createMikroOrmProvider(),
        createMikroOrmEntityManagerProvider(),
        createMikroOrmEntityManagerProvider('SqlEntityManager'),
        createMikroOrmEntityManagerProvider('MongoEntityManager'),
      ],
      exports: [MikroORM, EntityManager, 'SqlEntityManager', 'MongoEntityManager'],
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


    const isNestMiddleware = (
      consumer: MiddlewareConsumer
    ): consumer is NestMiddlewareConsumer =>
      typeof (consumer as any).httpAdapter === "object";

    const usingFastify = (consumer: NestMiddlewareConsumer) =>
      consumer.httpAdapter.constructor.name.toLowerCase().startsWith("fastify");

    const forRoutesPath =
      this.options.forRoutesPath ??
      (isNestMiddleware(consumer) && usingFastify(consumer) ? "(.*)" : "*");

    consumer
      .apply(MikroOrmMiddleware) // register request context automatically
      .forRoutes({ path: forRoutesPath, method: RequestMethod.ALL });
  }

}
