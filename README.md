# Base API (Hono)

This is a customizable starter api application built using [Bun](https://bun.sh) and [Hono](https://hono.dev).

## Features

-   Rest API
-   Database (postgres) Configurable to desired database
-   Database migration setup using knex
-   Logging (pino)
-   Tests (Unit, Integration and e2e)
-   Docker
-   Linting
-   Code formatting
-   Dependency Inject Architecture

## Project Setup

> Sample commands are for linux platforms.

Create a `.env` file in the root directory.

```bash
    touch .env
```

Copy the variables in the `.env.example` into the `.env` file.

```bash
    cp .env.example .env
```

Use the node version stated in the `.nvmrc` file.

```bash
    nvm use
```

You can use node version manager (`nvm`) to use multiple node versions on your system. [Windows](https://github.com/coreybutler/nvm-windows) or [Linux](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04#option-3-installing-node-using-the-node-version-manager)

## Run Locally

Install dependencies

```bash
  bun install
```

Start the server in development mode

```bash
  bun dev
```

Start the server in production mode

Build

```bash
    bun build
```

Start

```bash
    bun start
```

## Running Tests

Create a `.env.test` file in the tests util directory.

```bash
    touch tests/utils/.env.test
```

Copy the variables in the `.env.example` into the `.env` file and fill with test credentials.

```bash
    cp .env.example tests/utils/.env.test
```

Test

```bash
  bun test
```

Test Coverage

```bash
    bun test:coverage
```

## Database Migration

Creating a new migration file

```bash
    make migrate-add ARGS={{migration_file_name}}

    # E.g
     make migrate-add ARGS=add_users_table

     # If make is not available, the commands used are in the `Makefile` file in the root directory
     bunx knex migrate:make {{migration_file_name}} --knexfile ./knex/knexfile.ts -x ts
```

Migrating new migration files or database changes

```bash
    make migrate-run

    # test database
    make migrate-run-test

    # make not available
    bun --env-file .env.local knex migrate:latest --knexfile ./knex/knexfile.ts

    # make not available - test
    bun --env-file .env.local knex migrate:rollback --knexfile ./knex/knexfile.ts --env test
```
