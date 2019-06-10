import { Inject } from '@nestjs/common';
import { Entity, getRepositoryToken } from './mikro-orm.common';

export const InjectRepository = (entity: Entity) =>
  Inject(getRepositoryToken(entity));
