import { RequestContext, type MikroORM } from '@mikro-orm/core';
import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';

@Injectable()
export class MultipleMikroOrmMiddleware implements NestMiddleware {

  constructor(@Inject('MikroORMs') private readonly orm: MikroORM[]) {}

  use(req: unknown, res: unknown, next: (...args: any[]) => void) {
    RequestContext.create(this.orm.map(orm => orm.em), next);
  }

}
