import type { MiddlewareConsumer } from '@nestjs/common';
import { Global, Inject, Module, RequestMethod } from '@nestjs/common';

import { getMikroORMToken, MIKRO_ORM_MODULE_OPTIONS } from './mikro-orm.common';
import { MikroOrmMiddleware } from './mikro-orm.middleware';
import { MikroOrmMiddlewareModuleOptions } from './typings';
import type { NestMiddlewareConsumer } from './typings';
import type { MikroORM } from '@mikro-orm/core';

@Global()
@Module({})
export class MikroOrmMiddlewareModule {

  constructor(@Inject(MIKRO_ORM_MODULE_OPTIONS)
              private readonly options: MikroOrmMiddlewareModuleOptions) { }

  static forMiddleware(options: MikroOrmMiddlewareModuleOptions) {
    // Work around due to nestjs not supporting the ability to register multiple types
    // https://github.com/nestjs/nest/issues/770
    // https://github.com/nestjs/nest/issues/4786#issuecomment-755032258 - workaround suggestion
    const inject = (options.contextNames || ['default']).map(name => getMikroORMToken(name));
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
    const isNestMiddleware = (consumer: MiddlewareConsumer): consumer is NestMiddlewareConsumer => {
      return typeof (consumer as any).httpAdapter === 'object';
    };

    const usingFastify = (consumer: NestMiddlewareConsumer) => {
      return consumer.httpAdapter.constructor.name.toLowerCase().startsWith('fastify');
    };

    const forRoutesPath =
      this.options.forRoutesPath ??
      (isNestMiddleware(consumer) && usingFastify(consumer) ? '(.*)' : '*');

    consumer
      .apply(MikroOrmMiddleware) // register request context automatically
      .forRoutes({ path: forRoutesPath, method: RequestMethod.ALL });
  }

}
