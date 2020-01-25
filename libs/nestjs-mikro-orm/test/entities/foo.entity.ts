import { PrimaryKey, Entity, IdEntity } from 'mikro-orm';

@Entity()
export class Foo implements IdEntity<Foo> {
  @PrimaryKey()
  id!: number;
}
