import { PrimaryKey, Entity, Filter } from '@mikro-orm/core';

@Entity()
@Filter({ name: 'id', cond: args => ({ id: args.id }) })
export class Foo {

  @PrimaryKey()
  id!: number;

}
