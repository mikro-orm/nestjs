<p align="center" style="vertical-align:middle">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="200" alt="Nest Logo" /></a><br /><a href="https://mikro-orm.io/" target="blank"><img src="https://raw.githubusercontent.com/mikro-orm/mikro-orm/master/docs/static/img/logo-readme.svg?sanitize=true" width="200" alt="MikroORM"></a>
</p>

> Based on [dario1985/nestjs-mikro-orm](https://github.com/dario1985/nestjs-mikro-orm).

[![NPM version](https://img.shields.io/npm/v/@mikro-orm/nestjs.svg)](https://www.npmjs.com/package/@mikro-orm/nestjs)
[![Chat on slack](https://img.shields.io/badge/chat-on%20slack-blue.svg)](https://join.slack.com/t/mikroorm/shared_invite/enQtNTM1ODYzMzM4MDk3LWM4ZDExMjU5ZDhmNjA2MmM3MWMwZmExNjhhNDdiYTMwNWM0MGY5ZTE3ZjkyZTMzOWExNDgyYmMzNDE1NDI5NjA)
[![Downloads](https://img.shields.io/npm/dm/@mikro-orm/nestjs.svg)](https://www.npmjs.com/package/@mikro-orm/nestjs)
[![Build Status](https://github.com/mikro-orm/nestjs/workflows/tests/badge.svg?branch=master)](https://github.com/mikro-orm/nestjs/actions?workflow=tests)

## Description

The [MikroORM](https://github.com/mikro-orm/mikro-orm) module for [NestJS](https://github.com/nestjs/nest).

## 🚀 Quick Start

First install the module via `yarn` or `npm` and do not forget to install the database driver as well:

```bash
$ yarn add @mikro-orm/core @mikro-orm/nestjs @mikro-orm/mongodb     # for mongo
$ yarn add @mikro-orm/core @mikro-orm/nestjs @mikro-orm/mysql       # for mysql/mariadb
$ yarn add @mikro-orm/core @mikro-orm/nestjs @mikro-orm/mariadb     # for mysql/mariadb
$ yarn add @mikro-orm/core @mikro-orm/nestjs @mikro-orm/postgresql  # for postgresql
$ yarn add @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite      # for sqlite
```

or

```bash
$ npm i -s @mikro-orm/core @mikro-orm/nestjs @mikro-orm/mongodb     # for mongo
$ npm i -s @mikro-orm/core @mikro-orm/nestjs @mikro-orm/mysql       # for mysql/mariadb
$ npm i -s @mikro-orm/core @mikro-orm/nestjs @mikro-orm/mariadb     # for mysql/mariadb
$ npm i -s @mikro-orm/core @mikro-orm/nestjs @mikro-orm/postgresql  # for postgresql
$ npm i -s @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite      # for sqlite
```

Once the installation process is completed, we can import the `MikroOrmModule` into the root `AppModule`.

```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: ['../dist/entities'],
      entitiesTs: ['../src/entities'],
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
You can also omit the parameter to use the CLI config.

Afterward, the `EntityManager` will be available to inject across entire project (without importing any module elsewhere).

```ts
@Injectable()
export class MyService {

  constructor(private readonly orm: MikroORM,
              private readonly em: EntityManager) { }

}
```

To define which repositories shall be registered in the current scope you can use the `forFeature()` method. For example, in this way:

> You should **not** register your base entities via `forFeature()`, as there are no
> repositories for those. On the other hand, base entities need to be part of the list
> in `forRoot()` (or in the ORM config in general).

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
    private readonly photoRepository: EntityRepository<Photo>
  ) {}

  // ...

}
```

## Auto entities automatically

Manually adding entities to the entities array of the connection options can be 
tedious. In addition, referencing entities from the root module breaks application 
domain boundaries and causes leaking implementation details to other parts of the 
application. To solve this issue, static glob paths can be used.

Note, however, that glob paths are not supported by webpack, so if you are building 
your application within a monorepo, you won't be able to use them. To address this 
issue, an alternative solution is provided. To automatically load entities, set the 
`autoLoadEntities` property of the configuration object (passed into the `forRoot()` 
method) to `true`, as shown below: 

```ts
@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
```

With that option specified, every entity registered through the `forFeature()` 
method will be automatically added to the entities array of the configuration 
object.

> Note that entities that aren't registered through the `forFeature()` method, but 
> are only referenced from the entity (via a relationship), won't be included by 
> way of the `autoLoadEntities` setting.

> Using `autoLoadEntities` also has no effect on the MikroORM CLI - for that we 
> still need CLI config with the full list of entities. On the other hand, we can
> use globs there, as the CLI won't go thru webpack.

## Request scoped handlers in queues

As mentioned in the docs, we need a clean state for each request. That is handled
automatically thanks to the `RequestContext` helper registered via middleware. 

But middlewares are executed only for regular HTTP request handles, what if we need
a request scoped method outside of that? One example of that is queue handlers or 
scheduled tasks. 

We can use the `@UseRequestContext()` decorator. It requires you to first inject the
`MikroORM` instance to current context, it will be then used to create the context 
for you. Under the hood, the decorator will register new request context for your 
method and execute it inside the context. 

```ts
@Injectable()
export class MyService {

  constructor(private readonly orm: MikroORM) { }

  @UseRequestContext()
  async doSomething() {
    // this will be executed in a separate context
  }

}
```

## Serialization caveat

[NestJS built-in serialization](https://docs.nestjs.com/techniques/serialization) relies on [class-transformer](https://github.com/typestack/class-transformer). Since MikroORM wraps every single entity relation in a `Reference` or a `Collection` instance (for type-safety), this will make the built-in `ClassSerializerInterceptor` blind to any wrapped relations. In other words, if you return MikroORM entities from your HTTP or WebSocket handlers, all of their relations will NOT be serialized.

Luckily, MikroORM provides a [serialization API](https://mikro-orm.io/docs/serializing) which can be used in lieu of `ClassSerializerInterceptor`.

```typescript
@Entity()
export class Book {

  @Property({ hidden: true })   // --> Equivalent of class-transformer's `@Exclude`
  hiddenField: number = Date.now();
  
  @Property({ persist: false }) // --> Will only exist in memory (and will be serialized). Similar to class-transformer's `@Expose()`
  count?: number;
  
  @ManyToOne({ serializer: value => value.name, serializedName: 'authorName' })   // Equivalent of class-transformer's `@Transform()`
  author: Author;

}

```

## Using `AsyncLocalStorage` for request context

> Since v5 AsyncLocalStorage is used inside RequestContext helper so this section is no longer valid.

By default, the `domain` api is used in the `RequestContext` helper. Since `@mikro-orm/core@4.0.3`,
you can use the new `AsyncLocalStorage` too, if you are on up to date node version:

```typescript
// create new (global) storage instance
const storage = new AsyncLocalStorage<EntityManager>();

@Module({
  imports: [
    MikroOrmModule.forRoot({
      // ...
      registerRequestContext: false, // disable automatatic middleware
      context: () => storage.getStore(), // use our AsyncLocalStorage instance
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// register the request context middleware
const app = await NestFactory.create(AppModule, { ... });

app.use((req, res, next) => {
  storage.run(orm.em.fork(true, true), next);
});
```

## Using NestJS `Injection Scopes` for request context

Since `@nestjs/common@6`, you can use the new `Injection Scopes` (https://docs.nestjs.com/fundamentals/injection-scopes) too:

```typescript
import { Scope } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      // ...
      registerRequestContext: false, // disable automatatic middleware
      scope: Scope.REQUEST
    }),
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

Or, if you're using the Async provider:
```typescript
import { Scope } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      // ...
      useFactory: () => ({
        // ...
        registerRequestContext: false, // disable automatatic middleware
      }),
      scope: Scope.REQUEST
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

> Please note that this might have some impact on performance,
> see: https://docs.nestjs.com/fundamentals/injection-scopes#performance

## Using custom repositories

When using custom repositories, we can get around the need for `@InjectRepository()`
decorator by naming our repositories the same way as `getRepositoryToken()` method do:

```ts
export const getRepositoryToken = <T> (entity: EntityName<T>) => `${Utils.className(entity)}Repository`;
```

In other words, as long as we name the repository same was as the entity is called, 
appending `Repository` suffix, the repository will be registered automatically in 
the Nest.js DI container.

`**./author.entity.ts**`

```ts
@Entity({ customRepository: () => AuthorRepository })
export class Author {

  // to allow inference in `em.getRepository()`
  [EntityRepositoryType]?: AuthorRepository;

}
```

`**./author.repository.ts**`

```ts
export class AuthorRepository extends EntityRepository<Author> {

  // your custom methods...

}
```

As the custom repository name is the same as what `getRepositoryToken()` would
return, we do not need the `@InjectRepository()` decorator anymore:

```ts
@Injectable()
export class MyService {

  constructor(private readonly repo: AuthorRepository) { }

}
```

## App shutdown and cleanup

By default, NestJS does not listen for system process termination signals (for example SIGTERM). Because of this, the MikroORM shutdown logic will never executed if the process is terminated, which could lead to database connections remaining open and consuming resources. To enable this, the `enableShutdownHooks` function needs to be called when starting up the application.

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(3000);
}
```

More information about [enableShutdownHooks](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown)

## Multiple Database Connections

You can define multiple database connections by registering multiple `MikroOrmModule` and setting their `contextName`. If you want to use middleware request context you must disable automatic middleware and register `MikroOrmModule` with `forMiddleware()` or use NestJS `Injection Scope`

```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot({
      contextName: 'db1',
      registerRequestContext: false, // disable automatatic middleware
      ...
    }),
    MikroOrmModule.forRoot({
      contextName: 'db2',
      registerRequestContext: false, // disable automatatic middleware
      ...
    }),
    MikroOrmModule.forMiddleware()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

To access different `MikroORM`/`EntityManager` connections you have to use the new injection tokens `@InjectMikroORM()`/`@InjectEntityManager()` where you are required to pass the `contextName` in:

```ts
@Injectable()
export class MyService {

  constructor(@InjectMikroORM('db1') private readonly orm1: MikroORM,
              @InjectMikroORM('db2') private readonly orm2: MikroORM,
              @InjectEntityManager('db1') private readonly em1: EntityManager,
              @InjectEntityManager('db2') private readonly em2: EntityManager) { }

}
```

When defining your repositories with `forFeature()` method you will need to set which `contextName` you want it registered against:

```typescript
// photo.module.ts

@Module({
  imports: [MikroOrmModule.forFeature([Photo], 'db1')],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```

When using the `@InjectRepository` decorator you will also need to pass the `contextName` you want to get it from:

```typescript
@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo, 'db1')
    private readonly photoRepository: EntityRepository<Photo>
  ) {}

  // ...

}
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

## 🤝 Contributing

Contributions, issues and feature requests are welcome. Please read 
[CONTRIBUTING.md](CONTRIBUTING.md) 
for details on the process for submitting pull requests to us.

## Authors

👤 **Dario Mancuso**

- Github: [@dario1985](https://github.com/dario1985)

👤 **Martin Adámek**

- Twitter: [@B4nan](https://twitter.com/B4nan)
- Github: [@b4nan](https://github.com/b4nan)

See also the list of contributors who [participated](https://github.com/mikro-orm/nestjs/contributors) in this project.

## Show Your Support

Please ⭐️ this repository if this project helped you!

## 📝 License

Copyright © 2018 [Martin Adámek](https://github.com/b4nan).

This project is licensed under the MIT License - see the [LICENSE file](LICENSE) for details.
