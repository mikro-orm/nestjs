<p align="center" style="vertical-align:middle">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="200" alt="Nest Logo" /></a><br /><img src="https://raw.githubusercontent.com/b4nan/mikro-orm/master/docs/assets/img/logo-readme.svg?sanitize=true" width="200" alt="MikroORM">
</p>

## Description

The [MikroORM](https://b4nan.github.io/mikro-orm) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm i --save mikro-orm nestjs-mikro-orm
```

## Quick Start

Once the installation process is completed, we can import the `MikroOrmModule` into the root `ApplicationModule`.

```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot({
      entitiesDirs: ['../dist/entities'],
      entitiesDirsTs: ['../src/entities'],
      dbName: 'my-db-name.sqlite3',
      type: 'sqlite',
      baseDir: __dirname,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

The `forRoot()` method accepts the same configuration object as `init()` from the MikroORM package. 

Afterward, the `EntityManager` will be available to inject across entire project (without importing any module elsewhere).

To define which repositories shall be registered in the current scope you can use the `forFeature()` method. For example, in this way:

```typescript
// photo.module.ts

@Module({
  imports: [MikroOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```

and import it into the root `AppModule`:

```typescript
// app.module.ts
@Module({
  imports: [MikroOrmModule.forRoot(...), PhotoModule],
})
export class AppModule {}
```

In this way we can inject the `PhotoRepository` to the `PhotoService` using the `@InjectRepository()` decorator:

```typescript
@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: EntityRepository<IEntityType<Photo>>
  ) {}
...
```

## Testing

The `nestjs-mikro-orm` package exposes `getRepositoryToken()` function that returns prepared token based on a given entity to allow mocking the repository.

```typescript
@Module({
  providers: [
    PhotoService,
    {
      provide: getRepositoryToken(Photo),
      useValue: mockedRepository,
    },
  ],
})
export class PhotoModule {}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)