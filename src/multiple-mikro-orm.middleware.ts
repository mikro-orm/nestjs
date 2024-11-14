import { RequestContext, type MikroORM } from '@mikro-orm/core';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import { InjectMikroORMs } from './mikro-orm.common';

@Injectable()
export class MultipleMikroOrmMiddleware implements NestMiddleware {

  constructor(@InjectMikroORMs() private readonly orm: MikroORM[]) {}

  use(req: unknown, res: unknown, next: (...args: any[]) => void) {
    RequestContext.create(this.orm.map(orm => orm.em), next);
  }

}
