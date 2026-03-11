import { type DynamicModule, type MiddlewareConsumer, type NestModule, type OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { MikroOrmModuleOptions, MikroOrmModuleAsyncOptions, MikroOrmModuleSyncOptions } from './typings.js';
export declare class MikroOrmCoreModule implements NestModule, OnApplicationShutdown {
    private readonly options;
    private readonly moduleRef;
    constructor(options: MikroOrmModuleOptions, moduleRef: ModuleRef);
    static forRoot(options: MikroOrmModuleSyncOptions): Promise<DynamicModule>;
    static forRootAsync(options: MikroOrmModuleAsyncOptions): Promise<DynamicModule>;
    private static buildDynamicModule;
    /**
     * Tries to create the driver instance to use the actual entity manager implementation for DI symbol.
     * This helps with dependency resolution issues when importing the EM from driver package (e.g. `SqlEntityManager`).
     */
    private static createEntityManager;
    onApplicationShutdown(): Promise<void>;
    configure(consumer: MiddlewareConsumer): void;
    private static setContextName;
}
