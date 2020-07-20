import { AnyEntity, EntityName } from '@mikro-orm/core';
import { Module, DynamicModule } from '@nestjs/common';

import { createMikroOrmRepositoryProviders } from './mikro-orm.providers';
import { MikroOrmCoreModule } from './mikro-orm-core.module';
import { MikroOrmModuleAsyncOptions, MikroOrmModuleOptions } from './typings';

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

  static forFeature(options: EntityName<AnyEntity>[] | { entities?: EntityName<AnyEntity>[] }): DynamicModule {
    const entities = Array.isArray(options) ? options : (options.entities || []);
    const providers = createMikroOrmRepositoryProviders(entities);

    return {
      module: MikroOrmModule,
      providers: [...providers],
      exports: [...providers],
    };
  }

}
