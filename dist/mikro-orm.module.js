var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MikroOrmModule_1;
import { Module } from '@nestjs/common';
import { MikroOrmCoreModule } from './mikro-orm-core.module.js';
import { MikroOrmMiddlewareModule } from './mikro-orm-middleware.module.js';
import { MikroOrmEntitiesStorage } from './mikro-orm.entities.storage.js';
import { createMikroOrmRepositoryProviders } from './mikro-orm.providers.js';
let MikroOrmModule = MikroOrmModule_1 = class MikroOrmModule {
    /**
     * Clears the entity storage. This is useful for testing purposes, when you want to isolate the tests.
     * Keep in mind that this should be called when using a test runner that keeps the context alive between tests (like Vitest with threads disabled).
     */
    static clearStorage(contextName) {
        MikroOrmEntitiesStorage.clear(contextName);
    }
    static forRoot(options) {
        if (Array.isArray(options)) {
            return options.map(o => MikroOrmCoreModule.forRoot(o));
        }
        return MikroOrmCoreModule.forRoot(options);
    }
    static forRootAsync(options) {
        if (Array.isArray(options)) {
            return options.map(o => MikroOrmCoreModule.forRootAsync(o));
        }
        return MikroOrmCoreModule.forRootAsync(options);
    }
    static forFeature(options, contextName) {
        const entities = Array.isArray(options) ? options : options.entities || [];
        const name = Array.isArray(options) || contextName ? contextName : options.contextName;
        const providers = createMikroOrmRepositoryProviders(entities, name);
        for (const e of entities) {
            if (typeof e !== 'string') {
                MikroOrmEntitiesStorage.addEntity(e, name);
            }
        }
        return {
            module: MikroOrmModule_1,
            providers: [...providers],
            exports: [...providers],
        };
    }
    static forMiddleware(options) {
        return MikroOrmMiddlewareModule.forRoot(options);
    }
};
MikroOrmModule = MikroOrmModule_1 = __decorate([
    Module({})
], MikroOrmModule);
export { MikroOrmModule };
