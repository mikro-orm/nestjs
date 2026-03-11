import { type AnyEntity } from '@mikro-orm/core';
import { type DynamicModule } from '@nestjs/common';
import type { EntityName, MikroOrmModuleAsyncOptions, MikroOrmModuleFeatureOptions, MikroOrmModuleSyncOptions, MikroOrmMiddlewareModuleOptions, MaybePromise } from './typings.js';
export declare class MikroOrmModule {
    /**
     * Clears the entity storage. This is useful for testing purposes, when you want to isolate the tests.
     * Keep in mind that this should be called when using a test runner that keeps the context alive between tests (like Vitest with threads disabled).
     */
    static clearStorage(contextName?: string): void;
    static forRoot(options: MikroOrmModuleSyncOptions): MaybePromise<DynamicModule>;
    static forRoot(options: MikroOrmModuleSyncOptions[]): MaybePromise<DynamicModule>[];
    static forRootAsync(options: MikroOrmModuleAsyncOptions): MaybePromise<DynamicModule>;
    static forRootAsync(options: MikroOrmModuleAsyncOptions[]): MaybePromise<DynamicModule>[];
    static forFeature(options: EntityName<AnyEntity>[] | MikroOrmModuleFeatureOptions, contextName?: string): DynamicModule;
    static forMiddleware(options?: MikroOrmMiddlewareModuleOptions): DynamicModule;
}
