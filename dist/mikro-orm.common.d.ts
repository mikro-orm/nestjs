import { Logger } from '@nestjs/common';
import type { EntityName } from './typings.js';
export declare const MIKRO_ORM_MODULE_OPTIONS: unique symbol;
export declare const CONTEXT_NAMES: string[];
export declare const logger: Logger;
/**
 * Gets the injection token based on context name for the relevant MikroORM provider.
 * @param name The context name of the database connection.
 * @returns The MikroORM provider injection token for the supplied context name.
 */
export declare const getMikroORMToken: (name: string) => string;
/**
 * Injects a MikroORM provider based on the supplied context name.
 *
 * @param name The context name of the database connection.
 * @returns A parameter decorator which will cause NestJS to inject the relevant MikroORM provider.
 */
export declare const InjectMikroORM: (name: string) => PropertyDecorator & ParameterDecorator;
/**
 * Injects the MikroORMs provider.
 *
 * @returns A decorator which will cause NestJS to inject the MikroORMs provider.
 */
export declare const InjectMikroORMs: () => PropertyDecorator & ParameterDecorator;
/**
 * Gets the injection token based on context name for the relevant EntityManager provider.
 * @param name The context name of the database connection.
 * @returns The EntityManager provider injection token for the supplied context name.
 */
export declare const getEntityManagerToken: (name: string) => string;
/**
 * Injects an EntityManager provider based on the supplied context name.
 *
 * @param name The context name of the database connection.
 * @returns A parameter decorator which will cause NestJS to inject the relevant EntityManager provider.
 */
export declare const InjectEntityManager: (name: string) => PropertyDecorator & ParameterDecorator;
/**
 * Gets the injection token based on class and optionally based on context name.
 * @param entity The class of the Entity to use for the injected repository provider.
 * @param name An optional context name - required for multiple database connections. See: [Multiple Database Connections](https://mikro-orm.io/docs/usage-with-nestjs#multiple-database-connections)
 * @returns The EntityRepository provider injection token based on the supplied entity and context name.
 */
export declare const getRepositoryToken: <T extends object>(entity: EntityName<T>, name?: string) => string;
/**
 * Injects an EntityRepository provider.
 *
 * @param entity The class of the Entity to use for the injected repository provider.
 * @param name An optional context name - required for multiple database connections. See: [Multiple Database Connections](https://mikro-orm.io/docs/usage-with-nestjs#multiple-database-connections)
 * @returns A parameter decorator which will cause NestJS to inject the relevant EntityRepository provider.
 */
export declare const InjectRepository: <T extends object>(entity: EntityName<T>, name?: string) => PropertyDecorator & ParameterDecorator;
