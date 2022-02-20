import type { MiddlewareConsumer } from '@nestjs/common';
import { Global, Inject, Module, RequestMethod } from '@nestjs/common';

import { CONTEXT_NAMES, getMikroORMToken, MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import { MultipleMikroOrmMiddleware } from './multiple-mikro-orm.middleware';
import { MikroOrmMiddlewareModuleOptions } from './typings';
import type { MikroORM } from '@mikro-orm/core';
import { forRoutesPath } from './middleware.helper';

@Global()
@Module({})
export class MikroOrmMiddlewareModule {

  constructor(@Inject(MIKRO_ORM_MODULE_OPTIONS)
              private readonly options: MikroOrmMiddlewareModuleOptions) { }

  static forMiddleware(options?: MikroOrmMiddlewareModuleOptions) {
    // Work around due to nestjs not supporting the ability to register multiple types
    // https://github.com/nestjs/nest/issues/770
    // https://github.com/nestjs/nest/issues/4786#issuecomment-755032258 - workaround suggestion
    const inject = CONTEXT_NAMES.map(name => getMikroORMToken(name));
    return {
      module: MikroOrmMiddlewareModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
        {
          provide: 'MikroORMs',
          useFactory: (...args: MikroORM[]) => args,
          inject,
        },
      ],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(MultipleMikroOrmMiddleware)
      .forRoutes({ path: forRoutesPath(this.options, consumer), method: RequestMethod.ALL });
  }

}
