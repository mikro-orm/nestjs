import { EntityRepository, EntitySchema, defineEntity, p } from '@mikro-orm/core';

// EntitySchema test
export interface IBaz {
  id: number;
  name: string;
}

export class BazRepository extends EntityRepository<IBaz> {

  customMethod(): string {
    return 'custom';
  }

}

export const Baz = new EntitySchema<IBaz>({
  name: 'Baz',
  repository: () => BazRepository,
  properties: {
    id: { type: 'number', primary: true },
    name: { type: 'string' },
  },
});

// defineEntity test
export interface IQux {
  id: number;
  title: string;
}

export class QuxRepository extends EntityRepository<IQux> {

  anotherCustomMethod(): string {
    return 'another-custom';
  }

}

export const Qux = defineEntity({
  name: 'Qux',
  repository: () => QuxRepository,
  properties: {
    id: p.integer().primary(),
    title: p.string(),
  },
});
