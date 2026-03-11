import { EntityManager, type AnyEntity, type ForkOptions } from '@mikro-orm/core';
import { Scope, type Provider, type Type } from '@nestjs/common';
import type { EntityName, MikroOrmModuleAsyncOptions } from './typings.js';
export declare function createMikroOrmProvider(contextName?: string, type?: Type): Provider;
export declare function createEntityManagerProvider(scope?: Scope, entityManager?: Type, contextName?: string, forkOptions?: ForkOptions): Provider<EntityManager>;
export declare function createMikroOrmAsyncOptionsProvider(options: MikroOrmModuleAsyncOptions): Provider;
export declare function createAsyncProviders(options: MikroOrmModuleAsyncOptions): Provider[];
export declare function createMikroOrmRepositoryProviders(entities: EntityName<AnyEntity>[], contextName?: string): Provider[];
