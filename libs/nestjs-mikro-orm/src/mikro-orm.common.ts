import { MikroORM } from 'mikro-orm';
import { Logger } from '@nestjs/common';

export type Entity<T = any> = new (...args: any[]) => T;

export const MIKRO_ORM_MODULE_OPTIONS = Symbol('mikro-orm-module-options');

export const logger = new Logger(MikroORM.name);

export const getRepositoryToken = (entity: Entity) =>
  `${entity.name}Repository`;
