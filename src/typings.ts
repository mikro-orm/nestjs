import type { AnyEntity, EntityName as CoreEntityName, EntitySchema, IDatabaseDriver, Options } from '@mikro-orm/core';
import type { MiddlewareConsumer, ModuleMetadata, Scope, Type } from '@nestjs/common';
import type { AbstractHttpAdapter } from '@nestjs/core';

export interface NestMiddlewareConsumer extends MiddlewareConsumer {
  httpAdapter: AbstractHttpAdapter;
}

type MikroOrmNestScopeOptions = {
  /**
   * The NestJS provider scope to use for the EntityManager (and any subsequent downstream records).
   *
   * This scope will also impact the scope of Entity Repositories as they depend on the EntityManager.
   *
   * @see [NestJS Scope Hierarchy](https://docs.nestjs.com/fundamentals/injection-scopes#scope-hierarchy)
   */
  scope?: Scope;
};

export type MikroOrmMiddlewareModuleOptions = {
  /**
   * Routes to apply the middleware.
   *
   * For Fastify, the middleware applies to all routes using `(.*)`.
   *
   * For all other frameworks including Express, the middleware applies to all routes using `*`.
   */
  forRoutesPath?: string;
};

export type MikroOrmModuleOptions<D extends IDatabaseDriver = IDatabaseDriver> = {
  registerRequestContext?: boolean;
  /**
   * Specifies whether or not to automatically load the entities based on MikroOrmModule.forFeature invocations.
   *
   * @see [MikroOrm - NestJS - Load Entities Automatically](https://mikro-orm.io/docs/usage-with-nestjs#load-entities-automatically)
   *
   * @default false
   */
  autoLoadEntities?: boolean;
} & Options<D> & MikroOrmMiddlewareModuleOptions;

export interface MikroOrmModuleFeatureOptions {
  /**
   * The entities to provide an EntityRepository for.
   *
   * @see [MikroOrm - NestJS - Repositories](https://mikro-orm.io/docs/usage-with-nestjs#repositories)
   */
  entities?: EntityName<AnyEntity>[];
  /**
   * The context (database connection) to use for the entity repository.
   *
   * @see [MikroOrm - NestJS - Multiple Database Connections](https://mikro-orm.io/docs/usage-with-nestjs#multiple-database-connections)
   */
  contextName?: string;
}

export interface MikroOrmOptionsFactory<D extends IDatabaseDriver = IDatabaseDriver> {
  createMikroOrmOptions(contextName?: string): Promise<MikroOrmModuleOptions<D>> | MikroOrmModuleOptions<D>;
}

export interface MikroOrmModuleSyncOptions extends MikroOrmModuleOptions, MikroOrmNestScopeOptions { }

export interface MikroOrmModuleAsyncOptions<D extends IDatabaseDriver = IDatabaseDriver> extends Pick<ModuleMetadata, 'imports' | 'providers'>, MikroOrmNestScopeOptions {
  /**
   * The context name (database connection) to specify for this instance.
   *
   * When injecting repositories or entity manager instances, this context name will need to be specified where there are multiple datbaase connections.
   *
   * @see [MikroOrm - NestJS - Multiple Database Connections](https://mikro-orm.io/docs/usage-with-nestjs#multiple-database-connections)
   */
  contextName?: string;
  useExisting?: Type<MikroOrmOptionsFactory<D>>;
  useClass?: Type<MikroOrmOptionsFactory<D>>;
  useFactory?: (...args: any[]) => Promise<Omit<MikroOrmModuleOptions<D>, 'contextName'>> | Omit<MikroOrmModuleOptions<D>, 'contextName'>;
  inject?: any[];
}

export declare type EntityName<T extends AnyEntity<T>> = CoreEntityName<T> | EntitySchema;
