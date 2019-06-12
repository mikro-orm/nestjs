import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { MikroORM, RequestContext } from 'mikro-orm';

@Injectable()
export class MikroOrmMiddleware implements NestMiddleware {
  constructor(private readonly orm: MikroORM) {}

  use(req: Request, res: Response, next: (...args: any[]) => void) {
    RequestContext.create(this.orm.em, next);
  }
}
