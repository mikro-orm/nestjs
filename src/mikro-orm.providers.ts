import { EntityManager, EntitySchema, MetadataStorage, MikroORM, type AnyEntity, type ForkOptions } from '@mikro-orm/core';
import { Scope, type InjectionToken, type Provider, type Type } from '@nestjs/common';

import {
  MIKRO_ORM_MODULE_OPTIONS,
  getEntityManagerToken,
  getMikroORMToken,
  getRepositoryToken,
  logger,
} from './mikro-orm.common.js';
import { MikroOrmEntitiesStorage } from './mikro-orm.entities.storage.js';
import type {
  EntityName,
  MikroOrmModuleAsyncOptions,
  MikroOrmModuleOptions,
  MikroOrmOptionsFactory,
} from './typings.js';

export function createMikroOrmProvider(contextName?: string, type: Type = MikroORM): Provider {
  if (!contextName && type !== MikroORM) {
    return {
      provide: type,
      useFactory: orm => orm, // just a simple alias
      inject: [MikroORM], // depend on the ORM from core package
    };
  }

  return {
    provide: contextName ? getMikroORMToken(contextName) : type,
    useFactory: async (options: MikroOrmModuleOptions) => {
      options = { logger: logger.log.bind(logger), ...options };

      if (options.autoLoadEntities) {
        options.entities = [
          ...(options.entities || []),
          ...MikroOrmEntitiesStorage.getEntities(contextName),
        ] as string[];
        options.entitiesTs = [
          ...(options.entitiesTs || []),
          ...MikroOrmEntitiesStorage.getEntities(contextName),
        ] as string[];
        delete options.autoLoadEntities;
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
  forkOptions?: ForkOptions,
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
    useFactory: (orm: MikroORM) => (scope === Scope.DEFAULT ? orm.em : orm.em.fork({ useContext: true, ...forkOptions })),
    inject: [contextName ? getMikroORMToken(contextName) : MikroORM],
  };
}

export function createMikroOrmAsyncOptionsProvider(options: MikroOrmModuleAsyncOptions): Provider {
  if (options.useFactory) {
    return {
      provide: MIKRO_ORM_MODULE_OPTIONS,
      useFactory: async (...args: any[]) => {
        const factoryOptions = await options.useFactory!(...args);
        return options.contextName ? { contextName: options.contextName, ...factoryOptions } : factoryOptions;
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
    useFactory: async (optionsFactory: MikroOrmOptionsFactory) =>
      await optionsFactory.createMikroOrmOptions(options.contextName),
    inject,
  };
}

export function createAsyncProviders(options: MikroOrmModuleAsyncOptions): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [createMikroOrmAsyncOptionsProvider(options)];
  }

  if (options.useClass) {
    return [createMikroOrmAsyncOptionsProvider(options), { provide: options.useClass, useClass: options.useClass }];
  }

  throw new Error(
    'Invalid MikroORM async options: one of `useClass`, `useExisting` or `useFactory` should be defined.',
  );
}

export function createMikroOrmRepositoryProviders(entities: EntityName<AnyEntity>[], contextName?: string): Provider[] {
  const metadata = Object.values(MetadataStorage.getMetadata());
  const providers: Provider[] = [];
  const inject = contextName ? getEntityManagerToken(contextName) : EntityManager;

  (entities || []).forEach(entity => {
    const meta = entity instanceof EntitySchema
      ? entity.meta
      : (typeof entity === 'function' ? EntitySchema.REGISTRY.get(entity)?.meta : undefined) ?? metadata.find(meta => meta.class === entity);
    const repository = meta?.repository as unknown as (() => InjectionToken) | undefined;

    if (repository) {
      providers.push({
        provide: repository(),
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
