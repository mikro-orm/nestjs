import { Options } from '@mikro-orm/core';
import { ModuleMetadata, Type } from '@nestjs/common';

export type MikroOrmModuleOptions = {
  registerRequestContext?: boolean;
} & Options;

export interface MikroOrmOptionsFactory {
  createMikroOrmOptions(): Promise<MikroOrmModuleOptions> | MikroOrmModuleOptions;
}

export interface MikroOrmModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<MikroOrmOptionsFactory>;
  useClass?: Type<MikroOrmOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MikroOrmModuleOptions> | MikroOrmModuleOptions;
  inject?: any[];
}
