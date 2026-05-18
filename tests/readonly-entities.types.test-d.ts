import type { MikroOrmModuleAsyncOptions, MikroOrmModuleSyncOptions, MikroOrmOptionsFactory, MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { defineConfig, SqliteDriver } from '@mikro-orm/sqlite';
import { MikroOrmModule } from '@mikro-orm/nestjs';

class A {}
class B {}

const cfgPaths    = defineConfig({ entities: ['entities'], dbName: 'x' });
const cfgClasses  = defineConfig({ entities: [A, B],        dbName: 'x' });
const cfgReadonly = defineConfig({ entities: [A, B] as const, dbName: 'x' });

MikroOrmModule.forRoot(cfgPaths);
MikroOrmModule.forRoot(cfgClasses);
MikroOrmModule.forRoot(cfgReadonly);

MikroOrmModule.forRootAsync({ useFactory: () => cfgPaths });
MikroOrmModule.forRootAsync({ useFactory: () => cfgClasses });
MikroOrmModule.forRootAsync({ useFactory: () => cfgReadonly });
MikroOrmModule.forRootAsync({ useFactory: async () => cfgReadonly });

MikroOrmModule.forRootAsync({ driver: SqliteDriver, useFactory: () => cfgReadonly });

class Factory implements MikroOrmOptionsFactory {
  createMikroOrmOptions() { return cfgReadonly; }
}
class FactoryAsync implements MikroOrmOptionsFactory {
  async createMikroOrmOptions() { return cfgReadonly; }
}
MikroOrmModule.forRootAsync({ useClass: Factory });
MikroOrmModule.forRootAsync({ useExisting: Factory });

const _o1: MikroOrmModuleSyncOptions = cfgReadonly;
const _o2: MikroOrmModuleOptions = cfgReadonly;
const _o3: MikroOrmModuleAsyncOptions = { useFactory: () => cfgReadonly };
