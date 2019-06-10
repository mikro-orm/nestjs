import { PrimaryKey, Entity, IEntity } from 'mikro-orm';

@Entity()
export class Foo {
  @PrimaryKey()
  id!: number;
}

// tslint:disable no-empty-interface
export interface Foo extends IEntity {}
