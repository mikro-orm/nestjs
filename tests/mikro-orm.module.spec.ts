import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Logger, Inject, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MikroOrmModule, MikroOrmOptionsFactory, MikroOrmModuleOptions } from '../src';

const testOptions: MikroOrmModuleOptions = {
  dbName: 'test.sqlite3',
  type: 'sqlite',
  baseDir: __dirname,
  entities: ['entities'],
};

const myLoggerProvider = { provide: 'my-logger', useValue: new Logger() };

class ConfigService implements MikroOrmOptionsFactory {
  constructor(@Inject('my-logger') private readonly logger: Logger) {}
  createMikroOrmOptions(): MikroOrmModuleOptions {
    return {
      ...testOptions,
      logger: this.logger.log.bind(this.logger),
    };
  }
}

@Module({ providers: [ConfigService, myLoggerProvider], exports: [ConfigService]})
class ConfigModule {}

describe('MikroORM Module', () => {
  it('forRoot', async () => {
    const module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRoot(testOptions)],
    }).compile();

    const orm = module.get<MikroORM>(MikroORM);
    expect(orm).toBeDefined();
    expect(module.get<EntityManager>(EntityManager)).toBeDefined();
    await orm.close();
  });

  it('forRootAsync :useClass', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule, MikroOrmModule.forRootAsync({
        useClass: ConfigService,
        providers: [myLoggerProvider],
      })],
    }).compile();

    const orm = module.get<MikroORM>(MikroORM);
    expect(orm).toBeDefined();
    expect(module.get<EntityManager>(EntityManager)).toBeDefined();
    await orm.close();
  });

  it('forRootAsync :useExisting', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule, MikroOrmModule.forRootAsync({
        useExisting: ConfigService,
        imports: [ConfigModule],
      })],
    }).compile();

    const orm = module.get<MikroORM>(MikroORM);
    expect(orm).toBeDefined();
    expect(module.get<EntityManager>(EntityManager)).toBeDefined();
    await orm.close();
  });

  it('forRootAsync :useFactory', async () => {
    const module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRootAsync({
        useFactory: (logger: Logger) => ({
          ...testOptions,
          logger: logger.log.bind(logger),
        }),
        inject: ['my-logger'],
        providers: [myLoggerProvider],
      })],
    }).compile();

    const orm = module.get<MikroORM>(MikroORM);
    expect(orm).toBeDefined();
    expect(module.get<EntityManager>(EntityManager)).toBeDefined();
    await orm.close();
  });
});
