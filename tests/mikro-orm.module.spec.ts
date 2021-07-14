import { EntityManager, MikroORM, Options } from '@mikro-orm/core';
import { Inject, Logger, Module, Scope } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule, MikroOrmOptionsFactory } from '../src';

const testOptions: Options = {
  dbName: 'mikro_orm_test.db',
  type: 'sqlite',
  baseDir: __dirname,
  entities: ['entities'],
};

const myLoggerProvider = { provide: 'my-logger', useValue: new Logger() };

class ConfigService implements MikroOrmOptionsFactory {

  constructor(@Inject('my-logger') private readonly logger: Logger) { }

  createMikroOrmOptions(): Options {
    return {
      ...testOptions,
      logger: this.logger.log.bind(this.logger),
    };
  }

}

@Module({ providers: [ConfigService, myLoggerProvider], exports: [ConfigService] })
class ConfigModule { }

const getEntityManagerLoop = async (module: TestingModule): Promise<Set<number | string>> => {
  // this function mocks the contextId factory which is called on each request
  // it's looped 5 times and resolves the EntityManager provider 10 times
  // set only allows unique values, it should only return 5 items as it should resolve the same em with the same contextId

  const generatedIds = new Set<number | string>();

  for(let i = 0; i < 5; i++) {
    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    (await Promise.all([
      module.resolve(EntityManager, contextId),
      module.resolve(EntityManager, contextId),
    ])).forEach(em => generatedIds.add(em.id));
  }

  return generatedIds;
}

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

  it('forRoot should return a new em each request with request scope', async () => {
    const module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRoot({
        ...testOptions,
        scope: Scope.REQUEST
      })],
    }).compile();

    const idSet = await getEntityManagerLoop(module);

    expect(idSet.size).toBe(5);

    await module.get<MikroORM>(MikroORM).close();
  });

  it('forRootAsync should return a new em each request with request scope', async () => {
    const module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRootAsync({
        useFactory: (logger: Logger) => ({
          ...testOptions,
          logger: logger.log.bind(logger),
        }),
        inject: ['my-logger'],
        providers: [myLoggerProvider],
        scope: Scope.REQUEST
      })],
    }).compile();

    const idSet = await getEntityManagerLoop(module);

    expect(idSet.size).toBe(5);

    await module.get<MikroORM>(MikroORM).close();
  });

  it('forRoot should return the same em each request with default scope', async () => {
    const module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRoot({
        ...testOptions,
      })],
    }).compile();

    const idSet = await getEntityManagerLoop(module);

    expect(idSet.size).toBe(1);

    await module.get<MikroORM>(MikroORM).close();
  });

  it('forRootAsync should return the same em each request with default scope', async () => {
    const module = await Test.createTestingModule({
      imports: [MikroOrmModule.forRootAsync({
        useFactory: (logger: Logger) => ({
          ...testOptions,
          logger: logger.log.bind(logger),
        }),
        inject: ['my-logger'],
        providers: [myLoggerProvider]
      })],
    }).compile();

    const idSet = await getEntityManagerLoop(module);

    expect(idSet.size).toBe(1);

    await module.get<MikroORM>(MikroORM).close();
  });
});
