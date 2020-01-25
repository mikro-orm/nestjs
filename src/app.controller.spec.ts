import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from 'nestjs-mikro-orm';
import { Foo } from './entities/foo.entity';
import { MikroORM } from 'mikro-orm';

describe('AppController', () => {
  let appController: AppController;
  let orm: MikroORM;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          tsNode: true,
          entitiesDirs: ['entities'],
          dbName: 'my-db-name.sqlite3',
          type: 'sqlite',
          autoFlush: false,
          baseDir: __dirname,
        }),
        MikroOrmModule.forFeature({ entities: [Foo] }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    orm = app.get<MikroORM>(MikroORM);
  });

  afterEach(() => orm.close());

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      await expect(appController.getHello()).resolves.toBe('Hello World!');
    });
  });
});
