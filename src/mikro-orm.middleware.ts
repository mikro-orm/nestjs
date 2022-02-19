import type { MikroORM } from '@mikro-orm/core';
import { RequestContext } from '@mikro-orm/core';
import type { NestMiddleware } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MikroOrmMiddleware implements NestMiddleware {

  constructor(@Inject('MikroORMs') private readonly orm: MikroORM[]) {}

  use(req: unknown, res: unknown, next: (...args: any[]) => void) {
    RequestContext.create(this.orm.map(orm => orm.em), next);
  }

}
