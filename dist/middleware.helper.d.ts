import { type MiddlewareConsumer } from '@nestjs/common';
import type { MikroOrmMiddlewareModuleOptions } from './typings.js';
export declare function forRoutesPath(options: MikroOrmMiddlewareModuleOptions, consumer: MiddlewareConsumer): string;
