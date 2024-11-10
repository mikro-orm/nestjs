import { Utils, type AnyEntity } from '@mikro-orm/core';
import { Module, type DynamicModule } from '@nestjs/common';
import { MikroOrmCoreModule } from './mikro-orm-core.module';
import { MultipleMikroOrmModule } from './multiple-mikro-orm.module';
import { MikroOrmEntitiesStorage } from './mikro-orm.entities.storage';
import { createMikroOrmRepositoryProviders } from './mikro-orm.providers';
import {
  EntityName,
  MikroOrmModuleAsyncOptions,
  MikroOrmModuleFeatureOptions,
  MikroOrmModuleSyncOptions,
  MikroOrmMiddlewareModuleOptions,
} from './typings';

@Module({})
export class MikroOrmModule {

  /**
   * Clears the entity storage. This is useful for testing purposes, when you want to isolate the tests.
   * Keep in mind that this should be called when using a test runner that keeps the context alive between tests (like Vitest with threads disabled).
   */
  static clearStorage(contextName?: string) {
    MikroOrmEntitiesStorage.clear(contextName);
  }

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
    const name = (Array.isArray(options) || contextName) ? contextName : options.contextName;
    const providers = createMikroOrmRepositoryProviders(entities, name);

    for (const e of entities) {
      if (!Utils.isString(e)) {
        MikroOrmEntitiesStorage.addEntity(e, name);
      }
    }

    return {
      module: MikroOrmModule,
      providers: [...providers],
      exports: [...providers],
    };
  }

  /**
   * @deprecated Use `MultipleMikroOrmModule.forRoot()`. This signature will be removed in v7.
   */
  static forMiddleware(options?: MikroOrmMiddlewareModuleOptions): DynamicModule {
    return {
      module: MikroOrmModule,
      imports: [MultipleMikroOrmModule.forRoot(options)],
    };
  }

}
