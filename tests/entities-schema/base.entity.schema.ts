import { BaseEntity } from './base.entity';
import { EntitySchema } from "@mikro-orm/core";

export const baseEntitySchema = new EntitySchema<BaseEntity>({
  name: 'BaseEntity',
  abstract: true,
  properties: {
    id: {
      type: Number,
      primary: true,
      autoincrement: true,
    },
  },
})
