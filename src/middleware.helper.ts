import type { MikroOrmMiddlewareModuleOptions, NestMiddlewareConsumer } from './typings';
import { type MiddlewareConsumer, HttpStatus } from '@nestjs/common';

export function forRoutesPath(options: MikroOrmMiddlewareModuleOptions, consumer: MiddlewareConsumer) {
  if (options.forRoutesPath) {
    return options.forRoutesPath;
  }

  // detect nest v11 based on a newly added enum value
  if (HttpStatus.MULTI_STATUS) {
    return '{*all}';
  }

  const isFastify = (consumer: MiddlewareConsumer) => {
    if (typeof (consumer as any).httpAdapter !== 'object') {
      return false;
    }

    return (consumer as NestMiddlewareConsumer).httpAdapter.constructor.name.toLowerCase().startsWith('fastify');
  };

  return isFastify(consumer) ? '(.*)' : '*';
}
