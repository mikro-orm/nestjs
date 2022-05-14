import { EntityManager, MikroORM } from '@mikro-orm/core';
import type { Options, EntityRepository } from '@mikro-orm/core';
import { Inject, Logger, Module, Scope } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { MikroOrmOptionsFactory } from '../src';
import { CONTEXT_NAMES, getEntityManagerToken, getMikroORMToken, getRepositoryToken, MikroOrmModule } from '../src';
import { Foo } from './entities/foo.entity';
import { Bar } from './entities/bar.entity';

const testOptions: Options = {
  dbName: ':memory:',
  type: 'sqlite',
  baseDir: __dirname,
  entities: ['entities'],
};

const myLoggerProvider = { provide: 'my-logger', useValue: new Logger() };

class ConfigService implements MikroOrmOptionsFactory {

  constructor(@Inject('my-logger') private readonly logger: Logger) { }

  createMikroOrmOptions(contextName?: string): Options {
    const options = {
      ...testOptions,
      logger: this.logger.log.bind(this.logger),
    };

    return contextName ? { contextName, ...options } : options;
  }

}

@Module({ providers: [ConfigService, myLoggerProvider], exports: [ConfigService] })
class ConfigModule {}

const getEntityManagerLoop = async (module: TestingModule): Promise<Set<number | string>> => {
  // this function mocks the contextId factory which is called on each request
  // it's looped 5 times and resolves the EntityManager provider 10 times
  // set only allows unique values, it should only return 5 items as it should resolve the same em with the same contextId

  const generatedIds = new Set<number | string>();

  for (let i = 0; i < 5; i++) {
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
};

const checkProviders = async (module: TestingModule) => {
  const orm1 = module.get<MikroORM>(getMikroORMToken('database1'));
  const orm2 = module.get<MikroORM>(getMikroORMToken('database2'));
  const em1 = module.get<EntityManager>(getEntityManagerToken('database1'));
  const em2 = module.get<EntityManager>(getEntityManagerToken('database2'));

  expect(orm1).toBeDefined();
  expect(orm1.config.get('contextName')).toBe('database1');
  expect(orm2).toBeDefined();
  expect(orm2.config.get('contextName')).toBe('database2');
  expect(em1).toBeDefined();
  expect(em2).toBeDefined();
  expect(em1).not.toBe(em2);

  await orm1.close();
  await orm2.close();
};

describe('MikroORM Module', () => {

  beforeEach(() => {
    // Clear context names before each run, so we do not throw existing exception
    CONTEXT_NAMES.splice(0, CONTEXT_NAMES.length);
  });

  describe('Single Database', () => {
    it('forRoot', async () => {
      const module = await Test.createTestingModule({
        imports: [MikroOrmModule.forRoot(testOptions)],
      }).compile();

      const orm = module.get<MikroORM>(MikroORM);
      expect(orm).toBeDefined();
      expect(orm.config.get('contextName')).toBe('default');
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
      expect(orm.config.get('contextName')).toBe('default');
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
      expect(orm.config.get('contextName')).toBe('default');
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
      expect(orm.config.get('contextName')).toBe('default');
      expect(module.get<EntityManager>(EntityManager)).toBeDefined();
      await orm.close();
    });

    it('forRoot should return a new em each request with request scope', async () => {
      const module = await Test.createTestingModule({
        imports: [MikroOrmModule.forRoot({
          ...testOptions,
          scope: Scope.REQUEST,
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
          scope: Scope.REQUEST,
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
          providers: [myLoggerProvider],
        })],
      }).compile();

      const idSet = await getEntityManagerLoop(module);

      expect(idSet.size).toBe(1);

      await module.get<MikroORM>(MikroORM).close();
    });

    it('forFeature should return repository', async () => {
      const module = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRoot(testOptions),
          MikroOrmModule.forFeature([Foo]),
        ],
      }).compile();

      const orm = module.get<MikroORM>(MikroORM);
      const entityManager = module.get<EntityManager>(EntityManager);
      const repository = module.get<EntityRepository<Foo>>(getRepositoryToken(Foo));

      expect(orm).toBeDefined();
      expect(entityManager).toBeDefined();
      expect(repository).toBeDefined();

      await orm.close();
    });

    it('forFeature and autoLoadEntities enabled should return repository', async () => {
      const { entities, ...options } = testOptions;

      const module = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRoot({
            autoLoadEntities: true,
            ...options,
          }),
          MikroOrmModule.forFeature([Foo]),
        ],
      }).compile();

      const orm = module.get<MikroORM>(MikroORM);
      const entityManager = module.get<EntityManager>(EntityManager);
      const repository = module.get<EntityRepository<Foo>>(getRepositoryToken(Foo));

      expect(orm).toBeDefined();
      expect(entityManager).toBeDefined();
      expect(repository).toBeDefined();

      await orm.close();
    });
  });

  describe('Multiple Databases', () => {

    it('forRoot', async () => {
      const module = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRoot({
            contextName: 'database1',
            ...testOptions,
          }),
          MikroOrmModule.forRoot({
            contextName: 'database2',
            ...testOptions,
          }),
        ],
      }).compile();

      await checkProviders(module);
    });

    it('forRootAsync :useClass', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule,
          MikroOrmModule.forRootAsync({
            contextName: 'database1',
            useClass: ConfigService,
            providers: [myLoggerProvider],
          }),
          MikroOrmModule.forRootAsync({
            contextName: 'database2',
            useClass: ConfigService,
            providers: [myLoggerProvider],
          }),
        ],
      }).compile();

      await checkProviders(module);
    });

    it('forRootAsync :useExisting', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule,
          MikroOrmModule.forRootAsync({
            contextName: 'database1',
            useExisting: ConfigService,
            imports: [ConfigModule],
          }),
          MikroOrmModule.forRootAsync({
            contextName: 'database2',
            useExisting: ConfigService,
            imports: [ConfigModule],
          })],
      }).compile();

      await checkProviders(module);
    });

    it('forRootAsync :useFactory', async () => {
      const module = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRootAsync({
            contextName: 'database1',
            useFactory: (logger: Logger) => ({
              ...testOptions,
              logger: logger.log.bind(logger),
            }),
            inject: ['my-logger'],
            providers: [myLoggerProvider],
          }),
          MikroOrmModule.forRootAsync({
            contextName: 'database2',
            useFactory: (logger: Logger) => ({
              ...testOptions,
              logger: logger.log.bind(logger),
            }),
            inject: ['my-logger'],
            providers: [myLoggerProvider],
          }),
        ],
      }).compile();

      await checkProviders(module);
    });

    it('forFeature should return repositories', async () => {
      const module = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRoot({
            contextName: 'database1',
            ...testOptions,
          }),
          MikroOrmModule.forRoot({
            contextName: 'database2',
            ...testOptions,
          }),
          MikroOrmModule.forFeature([Foo], 'database1'),
          MikroOrmModule.forFeature({ entities: [Bar], contextName: 'database2' }),
        ],
      }).compile();

      const orm1 = module.get<MikroORM>(getMikroORMToken('database1'));
      const orm2 = module.get<MikroORM>(getMikroORMToken('database2'));
      const repository1 = module.get<EntityRepository<Foo>>(getRepositoryToken(Foo, 'database1'));
      const repository2 = module.get<EntityRepository<Bar>>(getRepositoryToken(Bar, 'database2'));

      expect(orm1).toBeDefined();
      expect(repository1).toBeDefined();
      expect(orm2).toBeDefined();
      expect(repository2).toBeDefined();

      await orm1.close();
      await orm2.close();
    });

    it('forFeature and autoLoadEntities enabled should return repository', async () => {
      const { entities, ...options } = testOptions;

      const module = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRoot({
            contextName: 'database1',
            autoLoadEntities: true,
            ...options,
          }),
          MikroOrmModule.forRoot({
            contextName: 'database2',
            autoLoadEntities: true,
            ...options,
          }),
          MikroOrmModule.forFeature([Foo], 'database1'),
          MikroOrmModule.forFeature({ entities: [Bar] }, 'database2'),
        ],
      }).compile();

      const orm1 = module.get<MikroORM>(getMikroORMToken('database1'));
      const orm2 = module.get<MikroORM>(getMikroORMToken('database2'));
      const repository1 = module.get<EntityRepository<Foo>>(getRepositoryToken(Foo, 'database1'));
      const repository2 = module.get<EntityRepository<Bar>>(getRepositoryToken(Bar, 'database2'));

      expect(() => module.get<EntityRepository<Foo>>(getRepositoryToken(Foo, 'database2'))).toThrow();
      expect(() => module.get<EntityRepository<Bar>>(getRepositoryToken(Bar, 'database1'))).toThrow();
      expect(orm1).toBeDefined();
      expect(repository1).toBeDefined();
      expect(orm2).toBeDefined();
      expect(repository2).toBeDefined();

      await orm1.close();
      await orm2.close();
    });
  });
});


