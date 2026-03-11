import { MikroORM } from '@mikro-orm/core';
import { type NestMiddleware } from '@nestjs/common';
export declare class MikroOrmMiddleware implements NestMiddleware {
    private readonly orm;
    constructor(orm: MikroORM);
    use(req: unknown, res: unknown, next: (...args: any[]) => void): void;
}
