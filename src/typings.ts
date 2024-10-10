import type { AnyEntity, EntityName as CoreEntityName, EntitySchema, ForkOptions, IDatabaseDriver, Options } from '@mikro-orm/core';
import type { MiddlewareConsumer, ModuleMetadata, Scope, Type } from '@nestjs/common';
import type { AbstractHttpAdapter } from '@nestjs/core';

export interface NestMiddlewareConsumer extends MiddlewareConsumer {
  httpAdapter: AbstractHttpAdapter;
}

type MikroOrmNestScopeOptions = {
  scope?: Scope;
  /**
   * An optional configuration object to use when forking the Event Manager if it is configured with a scope other than Scope.DEFAULT
   *
   * This configuration option has no effect when the scope is set to Scope.DEFAULT.
   *
   * https://mikro-orm.io/api/core/interface/ForkOptions
   */
  forkOptions?: ForkOptions;
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
  autoLoadEntities?: boolean;
} & Options<D> & MikroOrmMiddlewareModuleOptions;

export interface MikroOrmModuleFeatureOptions {
  entities?: EntityName<AnyEntity>[];
  contextName?: string;
}

export interface MikroOrmOptionsFactory<D extends IDatabaseDriver = IDatabaseDriver> {
  createMikroOrmOptions(contextName?: string): Promise<MikroOrmModuleOptions<D>> | MikroOrmModuleOptions<D>;
}

export interface MikroOrmModuleSyncOptions extends MikroOrmModuleOptions, MikroOrmNestScopeOptions { }

export interface MikroOrmModuleAsyncOptions<D extends IDatabaseDriver = IDatabaseDriver> extends Pick<ModuleMetadata, 'imports' | 'providers'>, MikroOrmNestScopeOptions {
  contextName?: string;
  useExisting?: Type<MikroOrmOptionsFactory<D>>;
  useClass?: Type<MikroOrmOptionsFactory<D>>;
  useFactory?: (...args: any[]) => Promise<Omit<MikroOrmModuleOptions<D>, 'contextName'>> | Omit<MikroOrmModuleOptions<D>, 'contextName'>;
  inject?: any[];
}

export declare type EntityName<T extends AnyEntity<T>> = CoreEntityName<T> | EntitySchema;
