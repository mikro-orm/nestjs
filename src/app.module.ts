import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from 'nestjs-mikro-orm';
import { Foo } from './entities/foo.entity';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entitiesDirs: ['../dist/entities'],
      entitiesDirsTs: ['../src/entities'],
      dbName: 'my-db-name.sqlite3',
      type: 'sqlite',
      baseDir: __dirname,
    }),
    MikroOrmModule.forFeature({ entities: [Foo] }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
