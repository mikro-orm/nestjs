import type { AnyEntity, EntityName } from '@mikro-orm/core';
import { Utils } from '@mikro-orm/core';
import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { createMikroOrmRepositoryProviders } from './mikro-orm.providers';
import { MikroOrmCoreModule } from './mikro-orm-core.module';
import type {
  MikroOrmModuleAsyncOptions,
  MikroOrmModuleSyncOptions,
  MikroOrmMiddlewareModuleOptions,
  MikroOrmModuleFeatureOptions,
} from './typings';
import { REGISTERED_ENTITIES } from './mikro-orm.common';
import { MikroOrmMiddlewareModule } from './mikro-orm-middleware.module';

@Module({})
export class MikroOrmModule {

  static forRoot(options?: MikroOrmModuleSyncOptions): DynamicModule {
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

  static forFeature(options: EntityName<AnyEntity>[] | MikroOrmModuleFeatureOptions, contextName?: string): DynamicModule {
    const entities = Array.isArray(options) ? options : (options.entities || []);
    const name = Array.isArray(options) ? contextName : options.contextName;
    const providers = createMikroOrmRepositoryProviders(entities, name);

    for (const e of entities) {
      if (!Utils.isString(e)) {
        REGISTERED_ENTITIES.add(e);
      }
    }

    return {
      module: MikroOrmModule,
      providers: [...providers],
      exports: [...providers],
    };
  }

  static forMiddleware(options?: MikroOrmMiddlewareModuleOptions): DynamicModule {
    return {
      module: MikroOrmModule,
      imports: [MikroOrmMiddlewareModule.forMiddleware(options)],
    };
  }

}
