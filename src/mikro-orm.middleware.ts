import { MikroORM, RequestContext } from '@mikro-orm/core';
import { Injectable, type NestMiddleware } from '@nestjs/common';

@Injectable()
export class MikroOrmMiddleware implements NestMiddleware {

  constructor(private readonly orm: MikroORM) {}

  use(req: unknown, res: unknown, next: (...args: any[]) => void) {
    RequestContext.create(this.orm.em, next);
  }

}
