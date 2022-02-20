import { PrimaryKey, Entity } from '@mikro-orm/core';

@Entity()
export class Bar {

  @PrimaryKey()
  id!: number;

}
