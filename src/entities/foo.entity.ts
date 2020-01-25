import { Entity, PrimaryKey, Property, IdEntity } from 'mikro-orm';

@Entity()
export class Foo implements IdEntity<Foo> {
  @PrimaryKey()
  id: number;

  @Property()
  title: string;
}
