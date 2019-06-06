import { MikroORM } from 'mikro-orm';
import { Logger } from '@nestjs/common';

export type Entity<T = any> = new(...args: any[]) => T;

export const logger = new Logger(MikroORM.name);

export const getRepositoryToken = (entity: Entity) =>
  `${entity.name}Repository`;
