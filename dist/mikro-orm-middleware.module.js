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
var MikroOrmMiddlewareModule_1;
import { Global, Inject, Module, RequestMethod } from '@nestjs/common';
import { forRoutesPath } from './middleware.helper.js';
import { CONTEXT_NAMES, getMikroORMToken, MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common.js';
import { MultipleMikroOrmMiddleware } from './multiple-mikro-orm.middleware.js';
let MikroOrmMiddlewareModule = MikroOrmMiddlewareModule_1 = class MikroOrmMiddlewareModule {
    options;
    constructor(options) {
        this.options = options;
    }
    static forRoot(options) {
        const inject = CONTEXT_NAMES.map(name => getMikroORMToken(name));
        return {
            module: MikroOrmMiddlewareModule_1,
            providers: [
                { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
                {
                    provide: 'MikroORMs',
                    useFactory: (...args) => args,
                    inject,
                },
            ],
            exports: ['MikroORMs'],
        };
    }
    configure(consumer) {
        consumer
            .apply(MultipleMikroOrmMiddleware)
            .forRoutes({ path: forRoutesPath(this.options, consumer), method: RequestMethod.ALL });
    }
};
MikroOrmMiddlewareModule = MikroOrmMiddlewareModule_1 = __decorate([
    Global(),
    Module({}),
    __param(0, Inject(MIKRO_ORM_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], MikroOrmMiddlewareModule);
export { MikroOrmMiddlewareModule };
