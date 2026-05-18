import type {
  MikroOrmModuleAsyncOptions,
  MikroOrmModuleSyncOptions,
  MikroOrmOptionsFactory,
  MikroOrmModuleOptions,
} from '@mikro-orm/nestjs';
import { defineConfig, SqliteDriver } from '@mikro-orm/sqlite';
import { MikroOrmModule } from '@mikro-orm/nestjs';

class A {}
class B {}

const cfgPaths = defineConfig({ entities: ['entities'], dbName: 'x' });
const cfgClasses = defineConfig({ entities: [A, B], dbName: 'x' });
const cfgReadonly = defineConfig({ entities: [A, B] as const, dbName: 'x' });

class Factory implements MikroOrmOptionsFactory {
  createMikroOrmOptions() {
    return cfgReadonly;
  }
}
class FactoryAsync implements MikroOrmOptionsFactory {
  async createMikroOrmOptions() {
    return cfgReadonly;
  }
}

// type-only — never executed; the file's purpose is to fail the build if these
// arguments stop type-checking against the module API.
export const _typecheck = () => {
  void MikroOrmModule.forRoot(cfgPaths);
  void MikroOrmModule.forRoot(cfgClasses);
  void MikroOrmModule.forRoot(cfgReadonly);

  void MikroOrmModule.forRootAsync({ useFactory: () => cfgPaths });
  void MikroOrmModule.forRootAsync({ useFactory: () => cfgClasses });
  void MikroOrmModule.forRootAsync({ useFactory: () => cfgReadonly });
  void MikroOrmModule.forRootAsync({ useFactory: async () => cfgReadonly });

  void MikroOrmModule.forRootAsync({ driver: SqliteDriver, useFactory: () => cfgReadonly });

  void MikroOrmModule.forRootAsync({ useClass: Factory });
  void MikroOrmModule.forRootAsync({ useClass: FactoryAsync });
  void MikroOrmModule.forRootAsync({ useExisting: Factory });

  const _o1: MikroOrmModuleSyncOptions = cfgReadonly;
  const _o2: MikroOrmModuleOptions = cfgReadonly;
  const _o3: MikroOrmModuleAsyncOptions = { useFactory: () => cfgReadonly };

  return [_o1, _o2, _o3];
};
