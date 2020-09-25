import { AnyEntity, EntityName, Utils } from '@mikro-orm/core';
import { DynamicModule, Module } from '@nestjs/common';

import { createMikroOrmRepositoryProviders } from './mikro-orm.providers';
import { MikroOrmCoreModule } from './mikro-orm-core.module';
import { MikroOrmModuleAsyncOptions, MikroOrmModuleSyncOptions } from './typings';
import { REGISTERED_ENTITIES } from './mikro-orm.common';

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

  static forFeature(options: EntityName<AnyEntity>[] | { entities?: EntityName<AnyEntity>[] }): DynamicModule {
    const entities = Array.isArray(options) ? options : (options.entities || []);
    const providers = createMikroOrmRepositoryProviders(entities);

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

}
