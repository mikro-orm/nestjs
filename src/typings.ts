import { Options, IDatabaseDriver } from '@mikro-orm/core';
import { MiddlewareConsumer, ModuleMetadata, Type } from '@nestjs/common';

export interface FastifyMiddlewareConsumer extends MiddlewareConsumer {
  httpAdapter: Record<string, unknown>;
}

export type MikroOrmModuleOptions<D extends IDatabaseDriver = IDatabaseDriver> = {
  registerRequestContext?: boolean;
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

export interface MikroOrmModuleAsyncOptions<D extends IDatabaseDriver = IDatabaseDriver> extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<MikroOrmOptionsFactory<D>>;
  useClass?: Type<MikroOrmOptionsFactory<D>>;
  useFactory?: (...args: any[]) => Promise<MikroOrmModuleOptions<D>> | MikroOrmModuleOptions<D>;
  inject?: any[];
}
