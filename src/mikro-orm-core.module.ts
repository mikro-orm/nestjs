import type { EntityManager } from '@mikro-orm/core';
import type { DynamicModule, OnApplicationShutdown, Type } from '@nestjs/common';
import { Global, Inject, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  getEntityManagerToken,
  getMikroORMToken,
  getMongoEntityManagerToken,
  getSqlEntityManagerToken,
  MIKRO_ORM_MODULE_OPTIONS,
} from './mikro-orm.common';
import { createAsyncProviders, createMikroOrmEntityManagerProvider, createMikroOrmProvider } from './mikro-orm.providers';
import type { MikroOrmModuleAsyncOptions, MikroOrmModuleSyncOptions } from './typings';
import { MikroOrmModuleOptions } from './typings';

enum EntityManagerModuleName {
  Knex = '@mikro-orm/knex',
  MongoDb = '@mikro-orm/mongodb',
}

type SqlEntityManagerExportObj = { SqlEntityManager: Type<EntityManager> };
type MongoEntityManagerExportObj = { MongoEntityManager: Type<EntityManager> };

type EntityManagerExportObj<TModuleName extends EntityManagerModuleName> =
  TModuleName extends EntityManagerModuleName.Knex ? SqlEntityManagerExportObj :
    TModuleName extends EntityManagerModuleName.MongoDb ? MongoEntityManagerExportObj :
      never;

// https://github.com/krzkaczor/ts-essentials/blob/d9034549ec1b3a72bf3f335fc54724349356dd7c/lib/types.ts
type AsyncOrSync<T> = PromiseLike<T> | T;
type Awaited<T> = T extends PromiseLike<infer PT> ? PT : never;

async function whenModuleAvailable<
  TModuleName extends EntityManagerModuleName,
  TReturnValue,
>(moduleName: TModuleName, returnFn: (module: EntityManagerExportObj<TModuleName>) => AsyncOrSync<TReturnValue>): Promise<[Awaited<TReturnValue>] | []> {
  try {
    const module = await import(moduleName);
    // TReturnValue may be incorrect if expecting it to extend Promise<T> since its being awaited in the return
    // casting to Awaited<TReturnValue> to satisfy the return type will prevent that confusion
    return [await returnFn(module) as Awaited<TReturnValue>];
  } catch (err) {
    return [];
  }
}

@Global()
@Module({})
export class MikroOrmCoreModule implements OnApplicationShutdown {

  constructor(@Inject(MIKRO_ORM_MODULE_OPTIONS)
              private readonly options: MikroOrmModuleOptions,
              private readonly moduleRef: ModuleRef) { }

  static async forRoot(options?: MikroOrmModuleSyncOptions): Promise<DynamicModule> {
    return {
      module: MikroOrmCoreModule,
      providers: [
        { provide: MIKRO_ORM_MODULE_OPTIONS, useValue: options || {} },
        createMikroOrmProvider(options?.contextName),
        createMikroOrmEntityManagerProvider(options?.scope, options?.contextName),
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ()  => createMikroOrmEntityManagerProvider(options?.scope, options?.contextName, getSqlEntityManagerToken(options?.contextName)))),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ()  => createMikroOrmEntityManagerProvider(options?.scope, options?.contextName, getMongoEntityManagerToken(options?.contextName)))),
      ],
      exports: [
        getMikroORMToken(options?.contextName),
        getEntityManagerToken(options?.contextName),
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ()  => getSqlEntityManagerToken(options?.contextName))),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ()  => getMongoEntityManagerToken(options?.contextName))),
      ],
    };
  }

  static async forRootAsync(options: MikroOrmModuleAsyncOptions): Promise<DynamicModule> {
    return {
      module: MikroOrmCoreModule,
      imports: options.imports || [],
      providers: [
        ...(options.providers || []),
        ...createAsyncProviders({ ...options, contextName: options.contextName }),
        createMikroOrmProvider(options?.contextName),
        createMikroOrmEntityManagerProvider(options.scope, options?.contextName),
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ()  => createMikroOrmEntityManagerProvider(options.scope, options?.contextName, getSqlEntityManagerToken(options?.contextName)))),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ()  => createMikroOrmEntityManagerProvider(options.scope, options?.contextName, getMongoEntityManagerToken(options?.contextName)))),
      ],
      exports: [
        getMikroORMToken(options?.contextName),
        getEntityManagerToken(options?.contextName),
        ...(await whenModuleAvailable(EntityManagerModuleName.Knex, ()  => getSqlEntityManagerToken(options?.contextName))),
        ...(await whenModuleAvailable(EntityManagerModuleName.MongoDb, ()  => getMongoEntityManagerToken(options?.contextName))),
      ],
    };
  }

  async onApplicationShutdown() {
    const orm = this.moduleRef.get(getMikroORMToken(this.options.contextName));

    if (orm) {
      await orm.close();
    }
  }

}
