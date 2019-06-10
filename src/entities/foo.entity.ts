import { Entity, PrimaryKey, Property, IEntity } from 'mikro-orm';

@Entity()
export class Foo {
  @PrimaryKey()
  id: number;

  @Property()
  title: string;
}

// tslint:disable-next-line:no-empty-interface
export interface Foo extends IEntity {}
