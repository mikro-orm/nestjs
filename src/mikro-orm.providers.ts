import { getEntityManagerToken, getMikroORMToken, getRepositoryToken, logger, MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import type { AnyEntity } from '@mikro-orm/core';
import { ConfigurationLoader, EntityManager, MetadataStorage, MikroORM } from '@mikro-orm/core';

import type { MikroOrmModuleAsyncOptions, MikroOrmModuleOptions, MikroOrmOptionsFactory, EntityName } from './typings';
import type { Provider, Type } from '@nestjs/common';
import { Scope } from '@nestjs/common';
import { MikroOrmEntitiesStorage } from './mikro-orm.entities.storage';

export function createMikroOrmProvider(contextName?: string): Provider {
  return {
    provide: contextName ? getMikroORMToken(contextName) : MikroORM,
    useFactory: async (options?: MikroOrmModuleOptions) => {
      if (options?.autoLoadEntities) {
        options.entities = [...(options.entities || []), ...MikroOrmEntitiesStorage.getEntities(contextName)];
        options.entitiesTs = [...(options.entitiesTs || []), ...MikroOrmEntitiesStorage.getEntities(contextName)];
        delete options.autoLoadEntities;
      }

      if (!options || Object.keys(options).length === 0) {
        const config = await ConfigurationLoader.getConfiguration();
        config.set('logger', logger.log.bind(logger));
        options = config as unknown as MikroOrmModuleOptions;
      }

      return MikroORM.init(options);
    },
    inject: [MIKRO_ORM_MODULE_OPTIONS],
  };
}

export function createEntityManagerProvider(
  scope = Scope.DEFAULT,
  entityManager: Type = EntityManager,
  contextName?: string,
): Provider<EntityManager> {
  if (!contextName && entityManager !== EntityManager) {
    return {
      provide: entityManager,
      scope,
      useFactory: (em: EntityManager) => em, // just a simple alias, unlike `useExisting` from nest, this works with request scopes too
      inject: [EntityManager], // depend on the EM from core package
    };
  }

  return {
    provide: contextName ? getEntityManagerToken(contextName) : entityManager,
    scope,
    useFactory: (orm: MikroORM) => scope === Scope.DEFAULT ? orm.em : orm.em.fork(),
    inject: [contextName ? getMikroORMToken(contextName) : MikroORM],
  };
}

export function createMikroOrmAsyncOptionsProvider(options: MikroOrmModuleAsyncOptions): Provider {
  if (options.useFactory) {
    return {
      provide: MIKRO_ORM_MODULE_OPTIONS,
      useFactory: (...args: any[]) => {
        const factoryOptions = options.useFactory!(...args);
        return options.contextName
          ? { contextName: options.contextName, ...factoryOptions }
          : factoryOptions;
      },
      inject: options.inject || [],
    };
  }

  const inject = [];

  if (options.useClass || options.useExisting) {
    inject.push(options.useClass ?? options.useExisting!);
  }

  return {
    provide: MIKRO_ORM_MODULE_OPTIONS,
    useFactory: async (optionsFactory: MikroOrmOptionsFactory) => await optionsFactory.createMikroOrmOptions(options.contextName),
    inject,
  };
}

export function createAsyncProviders(options: MikroOrmModuleAsyncOptions): Provider[] {
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
}

export function createMikroOrmRepositoryProviders(entities: EntityName<AnyEntity>[], contextName?: string): Provider[] {
  const metadata = Object.values(MetadataStorage.getMetadata());
  const providers: Provider[] = [];
  const inject = contextName ? getEntityManagerToken(contextName) : EntityManager;

  (entities || []).forEach(entity => {
    const meta = metadata.find(meta => meta.class === entity);

    if (meta?.customRepository) {
      providers.push({
        provide: meta.customRepository(),
        useFactory: em => em.getRepository(entity),
        inject: [inject],
      });
    }

    providers.push({
      provide: getRepositoryToken(entity, contextName),
      useFactory: em => em.getRepository(entity),
      inject: [inject],
    });
  });

  return providers;
}
