import { Injectable } from '@nestjs/common';
import { InjectRepository } from 'nestjs-mikro-orm';
import { Foo } from './entities/foo.entity';
import { EntityRepository, EntityManager } from 'mikro-orm';

@Injectable()
export class AppService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Foo)
    private readonly fooRepository: EntityRepository<Foo>,
  ) {}

  private async initTable() {
    return this.em.getConnection().execute(`CREATE TABLE IF NOT EXISTS foo (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL
    )`);
  }

  async getHello(): Promise<string> {
    await this.initTable();

    const foo = this.fooRepository.create({ title: 'Hello World!' });
    await this.fooRepository.persist(foo);
    await this.fooRepository.flush();

    return (await this.fooRepository.findOne(foo.id)).title;
  }
}
