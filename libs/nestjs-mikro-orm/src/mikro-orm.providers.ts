import { Entity, getRepositoryToken } from './mikro-orm.utils';
import { EntityManager } from 'mikro-orm';

export const createMikroOrmRepositoryProviders = (entities: Entity[]) => {
  return (entities || []).map(entity => ({
    provide: getRepositoryToken(entity),
    useFactory: (em: EntityManager) => em.getRepository(entity),
    inject: [EntityManager],
  }));
};
