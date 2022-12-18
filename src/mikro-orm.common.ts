import { MikroORM, Utils } from '@mikro-orm/core';
import { Inject, Logger } from '@nestjs/common';
import type { EntityName } from './typings';

export const MIKRO_ORM_MODULE_OPTIONS = Symbol('mikro-orm-module-options');
export const CONTEXT_NAMES: string[] = [];
export const logger = new Logger(MikroORM.name);

export const getMikroORMToken = (name: string) => `${name}_MikroORM`;
export const InjectMikroORM = (name: string) => Inject(getMikroORMToken(name));

export const getEntityManagerToken = (name: string) => `${name}_EntityManager`;
export const InjectEntityManager = (name: string) => Inject(getEntityManagerToken(name));

export const getRepositoryToken = <T extends object> (entity: EntityName<T>, name?: string) => {
  const suffix = name ? `_${name}` : '';
  return `${Utils.className(entity)}Repository${suffix}`;
};
export const InjectRepository = <T extends object> (entity: EntityName<T>, name?: string) => Inject(getRepositoryToken(entity, name));
