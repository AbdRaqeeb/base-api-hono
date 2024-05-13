
# Base API

This is a customizable starter api application built using [NodeJS](https://nodejs.org/) and [ExpressJS](https://expressjs.com).


## Features

- Rest API
- Database (postgres) Configurable to desired database  
- Logging (pino)
- Tests (Unit, Integration and e2e)
- Docker
- Linting
- Code formatting
- Dependency Inject Architecture

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
  yarn install
```

Start the server in development mode

```bash
  yarn dev
```

Start the server in production mode

Build

```bash
    yarn build
```

Start
```bash
    yarn start
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
  yarn test
```

Test Coverage

```bash
    yarn test:coverage
```

