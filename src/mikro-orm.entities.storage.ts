import type { AnyEntity } from '@mikro-orm/core';
import type { EntityName } from './typings';

export class MikroOrmEntitiesStorage {

  private static readonly storage = new Map<string, Set<EntityName<AnyEntity>>>();

  static addEntity(entity: EntityName<AnyEntity>, contextName = 'default') {
    let set = this.storage.get(contextName);
    if (!set) {
      set = new Set<EntityName<AnyEntity>>();
      this.storage.set(contextName, set);
    }

    set.add(entity);
  }

  static getEntities(contextName = 'default') {
    return this.storage.get(contextName)?.values() || [];
  }

  static clear(contextName = 'default') {
    const set = this.storage.get(contextName);
    if (!set) {
      return;
    }

    set.clear();
  }

}
