import { Options } from 'mikro-orm';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export type MikroOrmModuleOptions = Options;

export interface MikroOrmOptionsFactory {
  createMikroOrmOptions():
    | Promise<MikroOrmModuleOptions>
    | MikroOrmModuleOptions;
}

export interface MikroOrmModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<MikroOrmOptionsFactory>;
  useClass?: Type<MikroOrmOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MikroOrmModuleOptions> | MikroOrmModuleOptions;
  inject?: any[];
}
