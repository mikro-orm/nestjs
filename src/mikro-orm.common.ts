import { MikroORM, Utils } from '@mikro-orm/core';
import { Inject, Logger } from '@nestjs/common';
import type { EntityName } from './typings';

export const MIKRO_ORM_MODULE_OPTIONS = Symbol('mikro-orm-module-options');
export const CONTEXT_NAMES: string[] = [];
export const logger = new Logger(MikroORM.name);

/**
 * Gets the injection token based on context name for the relevant MikroORM provider.
 * @param name The context name of the database connection.
 * @returns The MikroORM provider injection token for the supplied context name.
 */
export const getMikroORMToken = (name: string) => `${name}_MikroORM`;
/**
 * Injects a MikroORM provider based on the supplied context name.
 *
 * @param name The context name of the database connection.
 * @returns A parameter decorator which will cause NestJS to inject the relevant MikroORM provider.
 */
export const InjectMikroORM = (name: string) => Inject(getMikroORMToken(name));

/**
 * Injects the MikroORMs provider.
 *
 * @returns A decorator which will cause NestJS to inject the MikroORMs provider.
 */
export const InjectMikroORMs = () => Inject('MikroORMs');

/**
 * Gets the injection token based on context name for the relevant EntityManager provider.
 * @param name The context name of the database connection.
 * @returns The EntityManager provider injection token for the supplied context name.
 */
export const getEntityManagerToken = (name: string) => `${name}_EntityManager`;
/**
 * Injects an EntityManager provider based on the supplied context name.
 *
 * @param name The context name of the database connection.
 * @returns A parameter decorator which will cause NestJS to inject the relevant EntityManager provider.
 */
export const InjectEntityManager = (name: string) => Inject(getEntityManagerToken(name));

/**
 * Gets the injection token based on class and optionally based on context name.
 * @param entity The class of the Entity to use for the injected repository provider.
 * @param name An optional context name - required for multiple database connections. See: [Multiple Database Connections](https://mikro-orm.io/docs/usage-with-nestjs#multiple-database-connections)
 * @returns The EntityRepository provider injection token based on the supplied entity and context name.
 */
export const getRepositoryToken = <T extends object> (entity: EntityName<T>, name?: string) => {
  const suffix = name ? `_${name}` : '';
  return `${Utils.className(entity)}Repository${suffix}`;
};
/**
 * Injects an EntityRepository provider.
 *
 * @param entity The class of the Entity to use for the injected repository provider.
 * @param name An optional context name - required for multiple database connections. See: [Multiple Database Connections](https://mikro-orm.io/docs/usage-with-nestjs#multiple-database-connections)
 * @returns A parameter decorator which will cause NestJS to inject the relevant EntityRepository provider.
 */
export const InjectRepository = <T extends object> (entity: EntityName<T>, name?: string) => Inject(getRepositoryToken(entity, name));
