import { AnyEntity, EntityName, MikroORM, RequestContext, Utils } from '@mikro-orm/core';
import { Inject, Logger } from '@nestjs/common';

export const MIKRO_ORM_MODULE_OPTIONS = Symbol('mikro-orm-module-options');
export const REGISTERED_ENTITIES = new Set<EntityName<AnyEntity>>();
export const logger = new Logger(MikroORM.name);
export const getRepositoryToken = <T> (entity: EntityName<T>) => `${Utils.className(entity)}Repository`;
export const InjectRepository = <T> (entity: EntityName<T>) => Inject(getRepositoryToken(entity));

export function UseRequestContext() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const context: any = this;

      if (!(context.orm instanceof MikroORM)) {
        throw new Error('@UseRequestContext() decorator can only be applied to methods of classes that carry `orm: MikroORM`');
      }

      let result;

      await RequestContext.createAsync(context.orm.em, async () => {
        result = await originalMethod.apply(context, args);
      });

      return result;
    };

    return descriptor;
  };
}

