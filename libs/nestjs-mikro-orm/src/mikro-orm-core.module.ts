import {
  Module,
  DynamicModule,
  Global,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import {
  MikroOrmModuleOptions,
  MikroOrmModuleAsyncOptions,
} from './mikro-orm-options.interface';
import {
  createMikroOrmProvider,
  createMikroOrmEntityManagerProvider,
  createAsyncProviders,
} from './mikro-orm.providers';
import { EntityManager, MikroORM } from 'mikro-orm';
import { MikroOrmMiddleware } from './mikro-orm.middleware';

@Global()
@Module({})
export class MikroOrmCoreModule {
  static forRoot(options: MikroOrmModuleOptions): DynamicModule {
    const mikroOrmModuleOptions = {
      provide: MIKRO_ORM_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: MikroOrmCoreModule,
      providers: [
        mikroOrmModuleOptions,
        createMikroOrmProvider(),
        createMikroOrmEntityManagerProvider(),
      ],
      exports: [MikroORM, EntityManager],
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
      ],
      exports: [MikroORM, EntityManager],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        MikroOrmMiddleware,
      ) /* Needed to keep a different identity mapper on each request */
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
