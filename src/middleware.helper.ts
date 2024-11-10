import type { MultiMikroOrmModuleOptions, NestMiddlewareConsumer } from './typings';
import type { MiddlewareConsumer } from '@nestjs/common';

export function forRoutesPath(options: MultiMikroOrmModuleOptions, consumer: MiddlewareConsumer) {
  const isNestMiddleware = (consumer: MiddlewareConsumer): consumer is NestMiddlewareConsumer => {
    return typeof (consumer as any).httpAdapter === 'object';
  };

  const usingFastify = (consumer: NestMiddlewareConsumer) => {
    return consumer.httpAdapter.constructor.name.toLowerCase().startsWith('fastify');
  };

  return options.forRoutesPath ??
    (isNestMiddleware(consumer) && usingFastify(consumer) ? '(.*)' : '*');
}
