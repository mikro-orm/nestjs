import { Module, DynamicModule } from '@nestjs/common';
import { Options, EntityValidator } from 'mikro-orm';
import { Entity } from './mikro-orm.utils';
import { createMikroOrmRepositoryProviders } from './mikro-orm.providers';
import { MikroOrmCoreModule } from './mikro-orm-core.module';

@Module({})
export class MikroOrmModule {
  static forRoot(options: Options): DynamicModule {
    return {
      module: MikroOrmModule,
      imports: [MikroOrmCoreModule.forRoot(options)],
    };
  }

  static forFeature(options: {
    entities?: Entity[];
    validators?: EntityValidator[];
  }): DynamicModule {
    const providers = [
      ...createMikroOrmRepositoryProviders((options && options.entities) || []),
    ];

    return {
      module: MikroOrmModule,
      providers: [...providers],
      exports: [...providers],
    };
  }
}
