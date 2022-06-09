## 5.0.2 (2022-05-09)


### Bug Fixes

* ensure correct application shutdown with forRootAsync and multiple databases ([#75](https://github.com/mikro-orm/nestjs/issues/75)) ([91b6faf](https://github.com/mikro-orm/nestjs/commit/91b6faf))
* ensure correct `contextName` in `forRootAsync` ([#74](https://github.com/mikro-orm/nestjs/issues/74)) ([4609e5d](https://github.com/mikro-orm/nestjs/commit/4609e5d))


## 5.0.1 (2022-03-11)


### Bug Fixes

* multiple database connection with `autoLoadEntities` ([#62](https://github.com/mikro-orm/nestjs/issues/62)) ([7dfc097](https://github.com/mikro-orm/nestjs/commit/7dfc0975523c1abe33bd6302237f1719e12fe4d5))


# [5.0.0](https://github.com/mikro-orm/nestjs/compare/v4.3.0...v5.0.0) (2022-02-20)


### Bug Fixes

* use constant imports for webpack bundling ([47f56ff](https://github.com/mikro-orm/nestjs/commit/47f56ff7ee6c8f784ffe7f32ae302d2c89f9ae11)), closes [#57](https://github.com/mikro-orm/nestjs/issues/57)


### Features

* support multiple database connections ([#56](https://github.com/mikro-orm/nestjs/issues/56)) ([df4725b](https://github.com/mikro-orm/nestjs/commit/df4725bd8e0ba70c86e8e597bfd6bb67ca4df36b))
* return value from UseRequestContext callback ([#28](https://github.com/mikro-orm/nestjs/issues/28)) ([4bf5b0f](https://github.com/mikro-orm/nestjs/commit/4bf5b0f8d16653a756b474315a92609c0bd7b632))


### BREAKING CHANGES

- MikroORM v5 and Nest v8 required
- `@UseRequestContext` decorator is now moved to the `core` package
- Node 14+ and TS 4.1+ required
- https://mikro-orm.io/docs/upgrading-v4-to-v5


# [4.3.0](https://github.com/mikro-orm/nestjs/compare/v4.2.0...v4.3.0) (2021-08-19)


### Features

* add support for nestjs@8.0.0 ([#29](https://github.com/mikro-orm/nestjs/issues/29)) ([e512067](https://github.com/mikro-orm/nestjs/commit/e51206762f9eb3e96bfc9edbb6abbf7ae8bc08a8))



# [4.2.0](https://github.com/mikro-orm/nestjs/compare/v4.1.0...v4.2.0) (2020-09-25)

### Features

* **core:** allow setting a custom scope for the EntityManager provider ([#9](https://github.com/mikro-orm/nestjs/issues/9)) ([c11e0ea](https://github.com/mikro-orm/nestjs/commit/c11e0ea)), closes [#2](https://github.com/mikro-orm/nestjs/issues/2)


# [4.1.0](https://github.com/mikro-orm/nestjs/compare/v4.0.0...v4.1.0) (2020-09-23)

### Features

* **core:** add `@UseRequestContext()` decorator ([7aeac9d](https://github.com/mikro-orm/nestjs/commit/7aeac9d)), closes [#5](https://github.com/mikro-orm/nestjs/issues/5)
* **core:** add `autoLoadEntities` option ([ceaf16e](https://github.com/mikro-orm/nestjs/commit/ceaf16e)), closes [#8](https://github.com/mikro-orm/nestjs/issues/8)


# [4.0.0](https://github.com/mikro-orm/nestjs/compare/v1.0.2...v4.0.0) (2020-09-08)

### Features

* support for MikroORM 4
* call `orm.close()` on app shutdown ([63a5c3f](https://github.com/mikro-orm/nestjs/commit/63a5c3f))
* support fastify ([5365e26](https://github.com/mikro-orm/nestjs/commit/5365e26))
* support `forRoot()` without options ([dfbfbcf](https://github.com/mikro-orm/nestjs/commit/dfbfbcf))
