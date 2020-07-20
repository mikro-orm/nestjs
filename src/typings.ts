import { Options } from '@mikro-orm/core';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface MikroOrmOptionsFactory {
  createMikroOrmOptions(): Promise<Options> | Options;
}

export interface MikroOrmModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<MikroOrmOptionsFactory>;
  useClass?: Type<MikroOrmOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<Options> | Options;
  inject?: any[];
}
