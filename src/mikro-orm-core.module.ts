import { EntityManager, MikroORM } from '@mikro-orm/core';
import { DynamicModule, Global, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import { MikroOrmModuleAsyncOptions, MikroOrmModuleOptions } from './typings';
import { createAsyncProviders, createMikroOrmEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers';
import { MikroOrmMiddleware } from './mikro-orm.middleware';

@Global()
@Module({})
export class MikroOrmCoreModule {

  static forRoot(options: MikroOrmModuleOptions): DynamicModule {
    return {
      module: MikroOrmCoreModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options },
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

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(MikroOrmMiddleware) // register request context automatically
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }

}
