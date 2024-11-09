import { EntityManager, MikroORM, type Options } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import {
  Controller,
  Get,
  type INestApplication,
  Injectable,
  MiddlewareConsumer,
  Module, type NestMiddleware,
  NestModule,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { InjectEntityManager, InjectMikroORM, MikroOrmModule } from '../src';
import { Bar } from './entities/bar.entity';
import { Foo } from './entities/foo.entity';

const testOptions: Options = {
  dbName: ':memory:',
  driver: SqliteDriver,
  baseDir: __dirname,
  entities: ['entities'],
};

@Controller('/foo')
class FooController {

  constructor(@InjectMikroORM('database-foo') private database1: MikroORM) {}

  @Get()
  foo() {
    return this.database1.em !== this.database1.em.getContext();
  }

}

@Controller('/bar')
class BarController {

  constructor(@InjectMikroORM('database-bar') private database2: MikroORM) {}

  @Get()
  bar() {
    return this.database2.em !== this.database2.em.getContext();
  }

}

@Injectable()
class TestMiddleware implements NestMiddleware {

  constructor(@InjectEntityManager('database-foo') private readonly em: EntityManager) {}

  use(req: unknown, res: unknown, next: (...args: any[]) => void) {
    // Throws error "Using global EntityManager instance methods for context specific actions is disallowed"
    this.em.setFilterParams('id', { id: '1' });

    return next();
  }

}

@Module({
  imports: [MikroOrmModule.forFeature([Foo], 'database-foo')],
  controllers: [FooController],
})
class FooModule implements NestModule {

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TestMiddleware)
      .forRoutes('/');
  }

}

@Module({
  imports: [MikroOrmModule.forFeature([Bar], 'database-bar')],
  controllers: [BarController],
})
class BarModule {}

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      contextName: 'database-foo',
      useFactory: () => ({
        registerRequestContext: false,
        ...testOptions,
      }),
    }),
    MikroOrmModule.forRoot({
      contextName: 'database-bar',
      registerRequestContext: false,
      ...testOptions,
    }),
    MikroOrmModule.forMiddleware(),
    FooModule,
    BarModule,
  ],
})
class TestModule {}

describe('Middleware executes request context for all MikroORM registered', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it(`forRoutes(/foo) should return error`, () => {
    return request(app.getHttpServer()).get('/foo').expect(500);
  });

  afterAll(async () => {
    await app.close();
  });
});
