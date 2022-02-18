import {
  getEntityManagerToken,
  getMikroORMToken,
  getRepositoryToken,
  logger,
  MIKRO_ORM_MODULE_OPTIONS,
  REGISTERED_ENTITIES,
} from './mikro-orm.common';
import type { AnyEntity, EntityName, EntityManagerType, IDatabaseDriver , EntityManager } from '@mikro-orm/core';
import { ConfigurationLoader, MikroORM, MetadataStorage } from '@mikro-orm/core';

import type { MikroOrmModuleAsyncOptions, MikroOrmModuleOptions, MikroOrmOptionsFactory } from './typings';
import type { Provider } from '@nestjs/common';
import { Scope } from '@nestjs/common';

export const createMikroOrmProvider = (contextName?: string): Provider => ({
  provide: getMikroORMToken(contextName),
  useFactory: async (options?: MikroOrmModuleOptions) => {
    if (options?.autoLoadEntities) {
      options.entities = [...(options.entities || []), ...REGISTERED_ENTITIES.values()];
      options.entitiesTs = [...(options.entitiesTs || []), ...REGISTERED_ENTITIES.values()];
      delete options.autoLoadEntities;
    }

    REGISTERED_ENTITIES.clear();

    if (!options || Object.keys(options).length === 0) {
      const config = await ConfigurationLoader.getConfiguration();
      config.set('logger', logger.log.bind(logger));
      options = config as unknown as MikroOrmModuleOptions;
    }

    return MikroORM.init(options);
  },
  inject: [MIKRO_ORM_MODULE_OPTIONS],
});

export type EntityManagerProvider = Provider<IDatabaseDriver[typeof EntityManagerType] & EntityManager>;

export const createMikroOrmEntityManagerProvider = (scope = Scope.DEFAULT, contextName = 'default', providerOverride?: string): EntityManagerProvider => {
  return {
    provide: providerOverride || getEntityManagerToken(contextName),
    scope,
    useFactory: (orm: MikroORM) => scope === Scope.DEFAULT ? orm.em : orm.em.fork(),
    inject: [getMikroORMToken(contextName)],
  };
};

export const createMikroOrmAsyncOptionsProvider = (options: MikroOrmModuleAsyncOptions): Provider => {
  if (options.useFactory) {
    return {
      provide: MIKRO_ORM_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  const inject = [];

  if (options.useClass || options.useExisting) {
    inject.push(options.useClass ?? options.useExisting!);
  }

  return {
    provide: MIKRO_ORM_MODULE_OPTIONS,
    useFactory: async (optionsFactory: MikroOrmOptionsFactory) => await optionsFactory.createMikroOrmOptions(),
    inject,
  };
};

export const createAsyncProviders = (options: MikroOrmModuleAsyncOptions): Provider[] => {
  if (options.useExisting || options.useFactory) {
    return [createMikroOrmAsyncOptionsProvider(options)];
  }

  if (options.useClass) {
    return [
      createMikroOrmAsyncOptionsProvider(options),
      { provide: options.useClass, useClass: options.useClass },
    ];
  }

  throw new Error('Invalid MikroORM async options: one of `useClass`, `useExisting` or `useFactory` should be defined.');
};

export const createMikroOrmRepositoryProviders = (entities: EntityName<AnyEntity>[], contextName = 'default'): Provider[] => {
  const metadata = Object.values(MetadataStorage.getMetadata());
  const providers: Provider[] = [];

  (entities || []).forEach(entity => {
    const meta = metadata.find(meta => meta.class === entity);

    if (meta?.customRepository) {
      providers.push({
        provide: meta.customRepository(),
        useFactory: em => em.getRepository(entity),
        inject: [getEntityManagerToken(contextName)],
      });
    }

    providers.push({
      provide: getRepositoryToken(entity, contextName),
      useFactory: em => em.getRepository(entity),
      inject: [getEntityManagerToken(contextName)],
    });
  });

  return providers;
};
