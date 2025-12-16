import { PrimaryKey, Entity } from '@mikro-orm/decorators/legacy';

@Entity()
export class Bar {
  @PrimaryKey()
  id!: number;
}
