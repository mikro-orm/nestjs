import {
  Module,
  DynamicModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { Entity } from './mikro-orm.common';
import { createMikroOrmRepositoryProviders } from './mikro-orm.providers';
import { MikroOrmCoreModule } from './mikro-orm-core.module';
import { MikroOrmModuleOptions } from './mikro-orm-options.interface';
import { MikroOrmModuleAsyncOptions } from './mikro-orm-options.interface';
import { MikroOrmMiddleware } from './mikro-orm.middleware';

@Module({})
export class MikroOrmModule {
  static forRoot(options: MikroOrmModuleOptions): DynamicModule {
    return {
      module: MikroOrmModule,
      imports: [MikroOrmCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: MikroOrmModuleAsyncOptions): DynamicModule {
    return {
      module: MikroOrmModule,
      imports: [MikroOrmCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(options: { entities?: Entity[] }): DynamicModule {
    const providers = createMikroOrmRepositoryProviders(
      (options && options.entities) || [],
    );

    return {
      module: MikroOrmModule,
      providers: [...providers],
      exports: [...providers],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(MikroOrmMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
