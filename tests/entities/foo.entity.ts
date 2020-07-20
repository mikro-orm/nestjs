import { PrimaryKey, Entity } from '@mikro-orm/core';

@Entity()
export class Foo {

  @PrimaryKey()
  id!: number;

}
