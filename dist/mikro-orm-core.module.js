var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MikroOrmCoreModule_1;
import { Configuration, EntityManager, MikroORM } from '@mikro-orm/core';
import { Global, Inject, Module, RequestMethod, } from '@nestjs/common';
// oxlint-disable-next-line consistent-type-imports
import { ModuleRef } from '@nestjs/core';
import { forRoutesPath } from './middleware.helper.js';
import { CONTEXT_NAMES, getEntityManagerToken, getMikroORMToken, MIKRO_ORM_MODULE_OPTIONS, } from './mikro-orm.common.js';
import { MikroOrmEntitiesStorage } from './mikro-orm.entities.storage.js';
import { MikroOrmMiddleware } from './mikro-orm.middleware.js';
import { createAsyncProviders, createEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers.js';
let MikroOrmCoreModule = MikroOrmCoreModule_1 = class MikroOrmCoreModule {
    options;
    moduleRef;
    constructor(options, moduleRef) {
        this.options = options;
        this.moduleRef = moduleRef;
    }
    static async forRoot(options) {
        const contextName = this.setContextName(options.contextName);
        const em = await this.createEntityManager(options);
        return this.buildDynamicModule(em, contextName, options, [
            { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options },
        ]);
    }
    static async forRootAsync(options) {
        const contextName = this.setContextName(options.contextName);
        const em = await this.createEntityManager(options);
        return this.buildDynamicModule(em, contextName, options, [...(options.providers || []), ...createAsyncProviders({ ...options, contextName: options.contextName })], options.imports || []);
    }
    static buildDynamicModule(em, contextName, options, baseProviders, imports = []) {
        if (em && !contextName) {
            return {
                module: MikroOrmCoreModule_1,
                imports,
                providers: [
                    ...baseProviders,
                    createMikroOrmProvider(contextName),
                    createMikroOrmProvider(contextName, em.getDriver().getORMClass()),
                    createEntityManagerProvider(options.scope, EntityManager, undefined, options.forkOptions),
                    createEntityManagerProvider(options.scope, em.constructor, undefined, options.forkOptions),
                ],
                exports: [MikroORM, EntityManager, em.constructor, em.getDriver().getORMClass()],
            };
        }
        return {
            module: MikroOrmCoreModule_1,
            imports,
            providers: [
                ...baseProviders,
                createMikroOrmProvider(contextName),
                ...(em ? [createMikroOrmProvider(contextName, em.getDriver().getORMClass())] : []),
                createEntityManagerProvider(options.scope, EntityManager, contextName, options.forkOptions),
                ...(em ? [createEntityManagerProvider(options.scope, em.constructor, contextName, options.forkOptions)] : []),
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
    static async createEntityManager(options) {
        if (options.contextName) {
            return undefined;
        }
        try {
            let config;
            if (typeof options === 'object' && options && 'driver' in options && !('useFactory' in options)) {
                config = new Configuration(options, false);
            }
            if (!config && 'useFactory' in options) {
                config = new Configuration(await options.useFactory(), false);
            }
            if (!config && options instanceof Configuration) {
                config = options;
            }
            return config?.getDriver().createEntityManager();
        }
        catch {
            if (options &&
                'useFactory' in options &&
                'inject' in options &&
                !options.driver &&
                options.inject.length > 0) {
                // oxlint-disable-next-line no-console
                console.warn('Support for driver specific imports in modules defined with `useFactory` and `inject` requires an explicit `driver` option. See https://github.com/mikro-orm/nestjs/pull/204');
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
    configure(consumer) {
        if (this.options.registerRequestContext === false) {
            return;
        }
        consumer
            .apply(MikroOrmMiddleware) // register request context automatically
            .forRoutes({ path: forRoutesPath(this.options, consumer), method: RequestMethod.ALL });
    }
    static setContextName(contextName) {
        if (!contextName) {
            return;
        }
        if (CONTEXT_NAMES.includes(contextName)) {
            throw new Error(`ContextName '${contextName}' already registered`);
        }
        CONTEXT_NAMES.push(contextName);
        return contextName;
    }
};
MikroOrmCoreModule = MikroOrmCoreModule_1 = __decorate([
    Global(),
    Module({}),
    __param(0, Inject(MIKRO_ORM_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object, ModuleRef])
], MikroOrmCoreModule);
export { MikroOrmCoreModule };
