import type { IDatabaseDriver, Options } from '@mikro-orm/core';
import type { MiddlewareConsumer, ModuleMetadata, Scope, Type } from '@nestjs/common';
import type { AbstractHttpAdapter } from '@nestjs/core';

export interface NestMiddlewareConsumer extends MiddlewareConsumer {
  httpAdapter: AbstractHttpAdapter;
}

type MikroOrmNestScopeOptions = {
  scope?: Scope;
};

export type MikroOrmModuleOptions<D extends IDatabaseDriver = IDatabaseDriver> = {
  registerRequestContext?: boolean;
  autoLoadEntities?: boolean;
  /**
   * Routes to apply the middleware.
   *
   * For Fastify, the middleware applies to all routes using `(.*)`.
   *
   * For all other frameworks including Express, the middleware applies to all routes using `*`.
   */
  forRoutesPath?: string;
} & Options<D>;

export interface MikroOrmOptionsFactory<D extends IDatabaseDriver = IDatabaseDriver> {
  createMikroOrmOptions(): Promise<MikroOrmModuleOptions<D>> | MikroOrmModuleOptions<D>;
}

export interface MikroOrmModuleSyncOptions extends MikroOrmModuleOptions, MikroOrmNestScopeOptions { }

export interface MikroOrmModuleAsyncOptions<D extends IDatabaseDriver = IDatabaseDriver> extends Pick<ModuleMetadata, 'imports' | 'providers'>, MikroOrmNestScopeOptions {
  contextName?: string;
  useExisting?: Type<MikroOrmOptionsFactory<D>>;
  useClass?: Type<MikroOrmOptionsFactory<D>>;
  useFactory?: (...args: any[]) => Promise<MikroOrmModuleOptions<D>> | MikroOrmModuleOptions<D>;
  inject?: any[];
}
