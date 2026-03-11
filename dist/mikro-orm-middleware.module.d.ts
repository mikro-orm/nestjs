import { type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import type { MikroORM } from '@mikro-orm/core';
import type { MikroOrmMiddlewareModuleOptions } from './typings.js';
export declare class MikroOrmMiddlewareModule implements NestModule {
    private readonly options;
    constructor(options: MikroOrmMiddlewareModuleOptions);
    static forRoot(options?: MikroOrmMiddlewareModuleOptions): {
        module: typeof MikroOrmMiddlewareModule;
        providers: ({
            provide: symbol;
            useValue: MikroOrmMiddlewareModuleOptions;
            useFactory?: undefined;
            inject?: undefined;
        } | {
            provide: string;
            useFactory: (...args: MikroORM[]) => MikroORM<import("@mikro-orm/core").IDatabaseDriver<import("@mikro-orm/core").Connection>, import("@mikro-orm/core").EntityManager<import("@mikro-orm/core").IDatabaseDriver<import("@mikro-orm/core").Connection>>, (string | import("@mikro-orm/core").EntitySchema<any, never> | import("@mikro-orm/core").EntityClass<Partial<any>>)[]>[];
            inject: string[];
            useValue?: undefined;
        })[];
        exports: string[];
    };
    configure(consumer: MiddlewareConsumer): void;
}
