import { Entity, PrimaryKey, Property } from 'mikro-orm';

@Entity()
export class Foo {
  @PrimaryKey()
  id: number;

  @Property()
  title: string;
}
