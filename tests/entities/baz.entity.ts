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

// defineEntity + setClass test (entity class passed to forFeature instead of schema)
export interface ICorge {
  id: number;
  label: string;
}

export class CorgeRepository extends EntityRepository<ICorge> {
  corgeMethod(): string {
    return 'corge';
  }
}

export class Corge {
  id!: number;
  label!: string;
}

export const CorgeSchema = defineEntity({
  name: 'Corge',
  repository: () => CorgeRepository,
  properties: {
    id: p.integer().primary(),
    label: p.string(),
  },
});
CorgeSchema.setClass(Corge);
