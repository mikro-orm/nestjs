import { PrimaryKey, Entity, Filter } from '@mikro-orm/decorators/legacy';

@Entity()
@Filter({ name: 'id', cond: args => ({ id: args.id }) })
export class Foo {
  @PrimaryKey()
  id!: number;
}
