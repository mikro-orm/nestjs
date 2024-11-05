import { defineConfig } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';

export default defineConfig({
  dbName: 'memory:',
  driver: SqliteDriver,
  baseDir: __dirname,
  entities: ['entities'],
  connect: false,
});
