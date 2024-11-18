import { EntityManager, MikroORM, type Options } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import {
  Controller,
  Get,
  Module,
  type INestApplication,
  Injectable,
  type MiddlewareConsumer,
  type NestMiddleware,
  type NestModule,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MikroOrmModule } from '../src';
import { Foo } from './entities/foo.entity';

const testOptions: Options = {
  dbName: ':memory:',
  driver: SqliteDriver,
  baseDir: __dirname,
  entities: ['entities'],
};

@Controller('/foo')
class FooController {

  constructor(private database1: MikroORM) {}

  @Get()
  foo() {
    return this.database1.em !== this.database1.em.getContext();
  }

}

@Injectable()
export class TestMiddleware implements NestMiddleware {

  constructor(private readonly em: EntityManager) {}

  use(req: unknown, res: unknown, next: (...args: any[]) => void) {
    this.em.setFilterParams('id', { id: '1' });

    return next();
  }

}

@Module({
  imports: [MikroOrmModule.forFeature([Foo])],
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
  imports: [
    MikroOrmModule.forRootAsync({
      useFactory: () => testOptions,
    }),
    FooModule,
  ],
})
class TestModule {}

describe('Middleware executes request context', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it(`forRoutes(/foo) should return 'true'`, () => {
    return request(app.getHttpServer()).get('/foo').expect(200, 'true');
  });

  afterAll(async () => {
    await app.close();
  });
});
