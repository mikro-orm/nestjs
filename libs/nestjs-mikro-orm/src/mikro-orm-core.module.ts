import { Module, DynamicModule, Global } from '@nestjs/common';
import {
  EntityManager,
  MikroORM,
  Options,
  EntityValidator,
} from 'mikro-orm';
import { Entity, logger } from './mikro-orm.utils';
import { createMikroOrmRepositoryProviders } from './mikro-orm.providers';

@Global()
@Module({})
export class MikroOrmCoreModule {
  static forRoot(options: Options): DynamicModule {
    const mikroOrmProvider = {
      provide: MikroORM,
      useFactory: async () => {
        return MikroORM.init({
          logger: logger.log.bind(logger),
          ...options,
        });
      },
    };

    const entityManagerProvider = {
      provide: EntityManager,
      useFactory: (orm: MikroORM) => orm.em,
      inject: [MikroORM],
    };

    return {
      module: MikroOrmCoreModule,
      providers: [mikroOrmProvider, entityManagerProvider],
      exports: [MikroORM, EntityManager],
    };
  }
}
