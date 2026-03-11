import type { AnyEntity } from '@mikro-orm/core';
import type { EntityName } from './typings.js';
export declare class MikroOrmEntitiesStorage {
    private static readonly storage;
    private static shouldClear;
    static addEntity(entity: EntityName<AnyEntity>, contextName?: string): void;
    static getEntities(contextName?: string): never[] | SetIterator<EntityName<Partial<any>>>;
    static clear(contextName?: string): void;
    /**
     * When the `addEntity` is called next, the storage will be cleared automatically before it.
     * We want to keep the cache, as it's populated on require time, but sometimes (tests) the contexts could be cleared.
     * This resolves both cases by deferring the `clear` call to the first `addEntity` call.
     */
    static clearLater(): void;
}
