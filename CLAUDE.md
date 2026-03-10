# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@mikro-orm/nestjs` is the official NestJS integration module for MikroORM. It provides `MikroOrmModule` with `forRoot`/`forRootAsync`/`forFeature` patterns for configuring MikroORM within NestJS applications, including support for multiple database connections, automatic entity loading, request context middleware, and repository injection.

## Commands

- **Build**: `yarn build` (clean + compile + copy meta files to dist)
- **Test**: `yarn test` (vitest, single run)
- **Single test**: `yarn test tests/mikro-orm.module.test.ts`
- **Test with coverage**: `yarn coverage`
- **Lint**: `yarn lint` (oxlint with type-aware checking)
- **Format**: `yarn format` (oxfmt)
- **Type-check tests**: `yarn tsc-check-tests`

## Architecture

The module follows NestJS dynamic module conventions with these key components:

- **`MikroOrmModule`** (`src/mikro-orm.module.ts`) — Public API exposing `forRoot()`, `forRootAsync()`, `forFeature()`, and `forMiddleware()`. Delegates initialization to `MikroOrmCoreModule`.
- **`MikroOrmCoreModule`** (`src/mikro-orm-core.module.ts`) — Internal global module handling ORM initialization, provider registration, middleware setup, and shutdown lifecycle. Supports driver-specific entity manager registration (e.g., `SqlEntityManager`).
- **Providers** (`src/mikro-orm.providers.ts`) — Factory functions creating NestJS providers for MikroORM instances, EntityManagers (with optional REQUEST scope), and repositories.
- **`MikroOrmEntitiesStorage`** (`src/mikro-orm.entities.storage.ts`) — Static registry accumulating entities registered via `forFeature()` for auto-loading.
- **Middleware** (`src/mikro-orm.middleware.ts`, `src/multiple-mikro-orm.middleware.ts`) — Request context isolation using MikroORM's `RequestContext`. Single and multi-DB variants.
- **Decorators/Tokens** (`src/mikro-orm.common.ts`) — `@InjectMikroORM()`, `@InjectEntityManager()`, `@InjectRepository()` decorators and corresponding token generators.
- **Types** (`src/typings.ts`) — `MikroOrmModuleSyncOptions`, `MikroOrmModuleAsyncOptions`, and related interfaces.

Multi-database support uses a `contextName` string to namespace tokens and providers.

## Tech Stack

- **Runtime**: Node.js >= 22.17, ESM
- **Language**: TypeScript 5.9 (strict mode, decorators enabled)
- **Test runner**: Vitest 4 with SWC transpilation
- **Linter**: oxlint (not ESLint)
- **Formatter**: oxfmt (not Prettier)
- **Package manager**: Yarn 4 (corepack)
- **Commits**: Conventional commits enforced via commitlint

## Peer Dependencies

The package requires users to install `@mikro-orm/core` (^7.0.0), `@nestjs/common` + `@nestjs/core` (^11.0.5), and `reflect-metadata`.
