import { Configuration, type Constructor, type DatabaseDriver, EntityManager, MikroORM } from '@mikro-orm/core';
import {
  Global,
  Inject,
  Module,
  RequestMethod,
  type DynamicModule,
  type MiddlewareConsumer,
  type NestModule,
  type OnApplicationShutdown,
  type Provider,
  type Type,
} from '@nestjs/common';
// oxlint-disable-next-line consistent-type-imports
import { ModuleRef } from '@nestjs/core';

import { forRoutesPath } from './middleware.helper.js';
import {
  CONTEXT_NAMES,
  getEntityManagerToken,
  getMikroORMToken,
  MIKRO_ORM_MODULE_OPTIONS,
} from './mikro-orm.common.js';
import { MikroOrmEntitiesStorage } from './mikro-orm.entities.storage.js';
import { MikroOrmMiddleware } from './mikro-orm.middleware.js';
import { createAsyncProviders, createEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers.js';
import type { MikroOrmModuleOptions, MikroOrmModuleAsyncOptions, MikroOrmModuleSyncOptions } from './typings.js';

@Global()
@Module({})
export class MikroOrmCoreModule implements NestModule, OnApplicationShutdown {
  constructor(
    @Inject(MIKRO_ORM_MODULE_OPTIONS)
    private readonly options: MikroOrmModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}

  static async forRoot(options: MikroOrmModuleSyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options.contextName);
    const em = await this.createEntityManager(options);
    return this.buildDynamicModule(em, contextName, options, [
      { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options },
    ]);
  }

  static async forRootAsync(options: MikroOrmModuleAsyncOptions): Promise<DynamicModule> {
    const contextName = this.setContextName(options.contextName);
    const em = await this.createEntityManager(options);
    return this.buildDynamicModule(
      em,
      contextName,
      options,
      [...(options.providers || []), ...createAsyncProviders({ ...options, contextName: options.contextName })],
      options.imports || [],
    );
  }

  private static buildDynamicModule(
    em: EntityManager<DatabaseDriver<any>> | undefined,
    contextName: string | undefined,
    options: MikroOrmModuleSyncOptions | MikroOrmModuleAsyncOptions,
    baseProviders: Provider[],
    imports: any[] = [],
  ): DynamicModule {
    if (em && !contextName) {
      return {
        module: MikroOrmCoreModule,
        imports,
        providers: [
          ...baseProviders,
          createMikroOrmProvider(contextName),
          createMikroOrmProvider(contextName, em.getDriver().getORMClass()),
          createEntityManagerProvider(options.scope, EntityManager, undefined, options.forkOptions),
          createEntityManagerProvider(options.scope, em.constructor as Constructor<EntityManager>, undefined, options.forkOptions),
        ],
        exports: [MikroORM, EntityManager, em.constructor, em.getDriver().getORMClass()],
      };
    }

    return {
      module: MikroOrmCoreModule,
      imports,
      providers: [
        ...baseProviders,
        createMikroOrmProvider(contextName),
        ...(em ? [createMikroOrmProvider(contextName, em.getDriver().getORMClass())] : []),
        createEntityManagerProvider(options.scope, EntityManager, contextName, options.forkOptions),
        ...(em ? [createEntityManagerProvider(options.scope, em.constructor as Type, contextName, options.forkOptions)] : []),
      ],
      exports: [
        contextName ? getMikroORMToken(contextName) : MikroORM,
        contextName ? getEntityManagerToken(contextName) : EntityManager,
        ...(em && !contextName ? [em.constructor, em.getDriver().getORMClass()] : []),
      ],
    };
  }

  /**
   * Tries to create the driver instance to use the actual entity manager implementation for DI symbol.
   * This helps with dependency resolution issues when importing the EM from driver package (e.g. `SqlEntityManager`).
   */
  private static async createEntityManager(
    options: MikroOrmModuleSyncOptions | MikroOrmModuleAsyncOptions,
  ): Promise<EntityManager<DatabaseDriver<any>> | undefined> {
    if (options.contextName) {
      return undefined;
    }

    try {
      let config;

      if (typeof options === 'object' && options && 'driver' in options && !('useFactory' in options)) {
        config = new Configuration(options, false);
      }

      // For async options with explicit driver hint, create a minimal config for EM type detection
      if (!config && 'driver' in options && options.driver) {
        config = new Configuration({ driver: options.driver } as any, false);
      }

      if (!config && 'useFactory' in options) {
        config = new Configuration(await options.useFactory!(), false);
      }

      if (!config && options instanceof Configuration) {
        config = options;
      }

      return config?.getDriver().createEntityManager() as EntityManager<DatabaseDriver<any>>;
    } catch {
      if (
        options &&
        'useFactory' in options &&
        'inject' in options &&
        !options.driver &&
        (options.inject as unknown[]).length > 0
      ) {
        // oxlint-disable-next-line no-console
        console.warn(
          'Support for driver specific imports in modules defined with `useFactory` and `inject` requires an explicit `driver` option. See https://github.com/mikro-orm/nestjs/pull/204',
        );
      }
    }
  }

  async onApplicationShutdown() {
    const token = this.options.contextName ? getMikroORMToken(this.options.contextName) : MikroORM;
    const orm = this.moduleRef.get(token);

    if (orm) {
      await orm.close();
      MikroOrmEntitiesStorage.clearLater();
    }

    CONTEXT_NAMES.length = 0;
  }

  configure(consumer: MiddlewareConsumer): void {
    if (this.options.registerRequestContext === false) {
      return;
    }

    consumer
      .apply(MikroOrmMiddleware) // register request context automatically
      .forRoutes({ path: forRoutesPath(this.options, consumer), method: RequestMethod.ALL });
  }

  private static setContextName(contextName?: string) {
    if (!contextName) {
      return;
    }

    if (CONTEXT_NAMES.includes(contextName)) {
      throw new Error(`ContextName '${contextName}' already registered`);
    }

    CONTEXT_NAMES.push(contextName);

    return contextName;
  }
}
