import type { Options } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import type { INestApplication } from '@nestjs/common';
import {
  Controller,
  Get,
  Module,
} from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InjectMikroORM, MikroOrmModule } from '../src';
import { Bar } from './entities/bar.entity';
import { Foo } from './entities/foo.entity';

const testOptions: Options = {
  dbName: ':memory:',
  driver: SqliteDriver,
  baseDir: __dirname,
  entities: ['entities'],
};

@Controller()
class TestController {

  constructor(
    @InjectMikroORM('database1') private database1: MikroORM,
    @InjectMikroORM('database2') private database2: MikroORM,
  ) {}

  @Get('foo')
  foo() {
    return this.database1.em !== this.database1.em.getContext();
  }

  @Get('bar')
  bar() {
    return this.database2.em !== this.database2.em.getContext();
  }

}

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      contextName: 'database1',
      useFactory: () => ({
        registerRequestContext: false,
        ...testOptions,
      }),
    }),
    MikroOrmModule.forRoot({
      contextName: 'database2',
      registerRequestContext: false,
      ...testOptions,
    }),
    MikroOrmModule.forMiddleware(),
    MikroOrmModule.forFeature([Foo], 'database1'),
    MikroOrmModule.forFeature([Bar], 'database2'),
  ],
  controllers: [TestController],
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

  it(`forRoutes(/foo) should return 'true'`, () => {
    return request(app.getHttpServer()).get('/foo').expect(200, 'true');
  });

  it(`forRoutes(/bar) should return 'true'`, () => {
    return request(app.getHttpServer()).get('/foo').expect(200, 'true');
  });

  afterAll(async () => {
    await app.close();
  });
});
