import {
  Entity,
  getRepositoryToken,
  logger,
  MIKRO_ORM_MODULE_OPTIONS,
} from './mikro-orm.common';
import { EntityManager, MikroORM } from 'mikro-orm';
import {
  MikroOrmModuleOptions,
  MikroOrmModuleAsyncOptions,
  MikroOrmOptionsFactory,
} from './mikro-orm-options.interface';
import { Provider } from '@nestjs/common';

export const createMikroOrmProvider = (): Provider => ({
  provide: MikroORM,
  useFactory: async (opts: MikroOrmModuleOptions) => {
    return MikroORM.init({
      logger: logger.log.bind(logger),
      ...opts,
    });
  },
  inject: [MIKRO_ORM_MODULE_OPTIONS],
});

export const createAsyncProviders = (
  options: MikroOrmModuleAsyncOptions,
): Provider[] => {
  if (options.useExisting || options.useFactory) {
    return [createMikroOrmAsyncOptionsProvider(options)];
  }

  if (options.useClass) {
    return [
      createMikroOrmAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  throw new Error(
    'Invalid MikroORM async options: one of `useClass`, `useExisting` or `useFactory` should be defined.',
  );
};

export const createMikroOrmEntityManagerProvider = (): Provider => ({
  provide: EntityManager,
  useFactory: (orm: MikroORM) => orm.em,
  inject: [MikroORM],
});

export const createMikroOrmAsyncOptionsProvider = (
  options: MikroOrmModuleAsyncOptions,
): Provider => {
  if (options.useFactory) {
    return {
      provide: MIKRO_ORM_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  const inject = [];
  if (options.useClass) {
    inject.push(options.useClass);
  } else if (options.useExisting) {
    inject.push(options.useExisting);
  }

  return {
    provide: MIKRO_ORM_MODULE_OPTIONS,
    useFactory: async (optionsFactory: MikroOrmOptionsFactory) =>
      await optionsFactory.createMikroOrmOptions(),
    inject,
  };
};

export const createMikroOrmRepositoryProviders = (
  entities: Entity[],
): Provider[] => {
  return (entities || []).map(entity => ({
    provide: getRepositoryToken(entity),
    useFactory: (em: EntityManager) => em.getRepository(entity),
    inject: [EntityManager],
  }));
};
