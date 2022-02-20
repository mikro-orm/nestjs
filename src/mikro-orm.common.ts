import type { AnyEntity, EntityName } from '@mikro-orm/core';
import { MikroORM, Utils } from '@mikro-orm/core';
import { Inject, Logger } from '@nestjs/common';

export const MIKRO_ORM_MODULE_OPTIONS = Symbol('mikro-orm-module-options');
export const REGISTERED_ENTITIES = new Set<EntityName<AnyEntity>>();
export const CONTEXT_NAMES = new Array<string>();
export const logger = new Logger(MikroORM.name);

export const getMikroORMToken = (name = 'default') => `${name}_MikroORM`;
export const InjectMikroORM = (name: string) => Inject(getMikroORMToken(name));

export const getEntityManagerToken = (name = 'default') => `${name}_EntityManager`;
export const InjectEntityManager = (name: string) => Inject(getEntityManagerToken(name));
export const getSqlEntityManagerToken = (name = 'default') => `${name}_SqlEntityManager`;
export const InjectSqlEntityManager = (name: string) => Inject(getSqlEntityManagerToken(name));
export const getMongoEntityManagerToken = (name = 'default') => `${name}_MongoEntityManager`;
export const InjectMongoEntityManager = (name: string) => Inject(getMongoEntityManagerToken(name));

export const getRepositoryToken = <T> (entity: EntityName<T>, name = 'default') => `${Utils.className(entity)}Repository_${name}`;
export const InjectRepository = <T> (entity: EntityName<T>, name: string) => Inject(getRepositoryToken(entity, name));
