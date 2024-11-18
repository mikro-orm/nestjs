import { EntityManager, MikroORM, type Options } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import {
  Controller,
  Get,
  Module,
  type INestApplication,
  Injectable,
  type NestMiddleware,
  MiddlewareConsumer,
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

  constructor(@InjectMikroORM('database-multi-foo') private database1: MikroORM) {}

  @Get()
  foo() {
    return this.database1.em !== this.database1.em.getContext();
  }

}

@Controller('/bar')
class BarController {

  constructor(@InjectMikroORM('database-multi-bar') private database2: MikroORM) {}

  @Get()
  bar() {
    return this.database2.em !== this.database2.em.getContext();
  }

}

@Injectable()
export class TestMiddleware implements NestMiddleware {

  constructor(@InjectEntityManager('database-multi-foo') private readonly em: EntityManager) {}

  use(req: unknown, res: unknown, next: (...args: any[]) => void) {
    this.em.setFilterParams('id', { id: '1' });

    return next();
  }

}

@Module({
  imports: [MikroOrmModule.forFeature([Foo], 'database-multi-foo')],
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
  imports: [MikroOrmModule.forFeature([Bar], 'database-multi-bar')],
  controllers: [BarController],
})
class BarModule {}

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      contextName: 'database-multi-foo',
      useFactory: () => ({
        registerRequestContext: false,
        ...testOptions,
      }),
    }),
    MikroOrmModule.forRoot({
      contextName: 'database-multi-bar',
      registerRequestContext: false,
      ...testOptions,
    }),
    MikroOrmModule.forMiddleware(),
    FooModule,
    BarModule,
  ],
})
class TestMultiModule {}

describe('Multiple Middleware executes request context for all MikroORM registered', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestMultiModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it(`forRoutes(/foo) should return 'true'`, () => {
    return request(app.getHttpServer()).get('/foo').expect(200, 'true');
  });

  it(`forRoutes(/bar) should return 'true'`, () => {
    return request(app.getHttpServer()).get('/bar').expect(200, 'true');
  });

  afterAll(async () => {
    await app.close();
  });
});
