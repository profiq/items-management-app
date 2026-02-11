# profiq reference app

## Basic setup

### Getting started

To get started, first clone this repository and enter it

```shell
git clone git@gitlab.com:profiq/all/infra/profiq-reference-app.git profiq-reference-app
cd profiq-reference-app
```

Then, run the following command inside the project root directory

```shell
npm install
```

Then, you need to create `.env`. Refer to the [`.env.example`](.env.example) file or to the [Environment variables](#environment-variables) section of README for the structure of this file.

Afterwards, if you do not want to use the emulator instead of the cloud, run

```shell
npm run firebase:emulator -w frontend
```

Now, you can start the frontend

```shell
npm run dev:frontend
```

and the backend

```shell
npm run dev:backend
```

### Structure

The project is divided into two packages in the following directories

```
.
├── frontend/
└── backend/
```

### Environment variables

You need to define the following variables in the .env file located in the root directory of the project:

#### Frontend env

Due to frontend being built using [vite](https://vite.dev/), we need to prefix the environment variables meant for frontend usage with `VITE_`. For more information about why this is the case, refer to the documentation: [Vite Guide - Env Variables and Modes](https://vite.dev/guide/env-and-mode)

##### Firebase

The following environmental variables can be obtained from firebase project admin console

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

You can also use [emulator](https://firebase.google.com/docs/emulator-suite) instead of running on the cloud

```
VITE_FIREBASE_EMULATE=            # 'true' or 'false'
VITE_FIREBASE_EMULATOR_URL=       # URL of the emulator obtained during emulator startup, e.g. http://localhost:9099
```

##### Other frontend env

URL of the backend service

```
VITE_API_URL=
```

#### Backend env

Project id of firebase

```
FIREBASE_PROJECT_ID=
```

the client email of google service account

```
GOOGLE_CLIENT_EMAIL=
```

Environment variable with the private key of the service account

```
GOOGLE_PRIVATE_KEY=
```

An optional env variable allowing to specify the port

```
PORT=
```

## Testing

### Frontend

Frontend contains unit and component tests written using vitest. Component tests use playwright as the backend.

Unit tests have file name format `{tested-part}.unit-spec.ts`. Component tests have name format `{tested-part}.component-spec.ts`.

To test the frontend, run the following commands from the project root

```shell
npn run init:playwright -w frontend
npm run test -w frontend
```

Both unit and component tests are run using this command.

### Backend

Backend contains unit and e2e tests written using jest. E2E tests use Supertest to simulate HTTP and Google Local Emulator Suite for auth.

Unit tests have file name format `{tested-part}.spec.ts` and are located next to the tested file. E2E tests have file name format of `{tested-part}.e2e-spec.ts` and are located in the `test/` directory.

To test the backend, run the following commands from the project root

```shell
npm run test -w backend
npm run test:e2e-emulator -w backend
```

The first runs the unit tests and the second runs the e2e tests.

---

# Architecture

There are four components in the architecture of the project:

- FE - React SPA
- BE - NestJS + SQL-based DB
- CI / CD - GitLab CI pipelines
- Google Cloud deployment - one project for dev, one for prod

All the secrets are kept in environment variables loaded from `.env` file in the root on startup.

---

## Goal

The goal of this project is to build a reference project & architecture for all our future project. Meaning we want to have everything in this project correct.
And it will be inspiration for all the future projects.

There will be 4 main components of this project:

- FE (React SPA)
- BE (NestJS with SQL based DB)
- CI / CD (Gitlab CI pipelines ) & git management
- Deployment on Google Cloud (development & production)

### Setup

- Monorepo with 2 packages -- BE & FE
- npm with package version pinning

### FE

- React SPA (Single page app) with CSR (client side rendering) - (we don't want to use any server components etc)
  - VITE tooling
  - Unit tests for regular code
  - Unit tests for React code
- Typescript
- Code style
  - Prettier / eslint (added on git hooks)
- Libraries
  - React Router
    - With declarative mode https://reactrouter.com/start/declarative/routing
  - Tanstack query for API calls / caching
  - Few simple components with ShadCN + Tailwind for styling
- Authorization -- google firebase Authorization - allow only @profiq.com emails to login
- .env file for configuration
- Features:
  - Login to the app
  - Navigate to a different tab (routing example)
  - CRUD operations
- Deployment
  - Deployed to Firebase hosting
- Stretch goals:
  - e2e test automation with Playwright
  - Document testing of the app (test plan)

### BE

- NestJS with Typescript
- Rest API
  - Proper status codes / error handling / logging / HTTP methods
- Authorization middlware connected to the firebase auth
- Proper logging & tracing of requests (TBD logging)
- ORM (TBD)
- .env file for configuration

### CI / CD & Git management

#### Git flow

- main branch (we never push directly to the main branch)
  - we don't have any development branch or anything like that
- Features branches
  - For new things we create feature branches - and then we create merge request where CI runs

#### CI

- on PR we want to run all the tests
  - 1# Check prettier / eslint (even though it's in git hooks this needs to run in CI!!)
  - Run build
  - Run unit tests
  - run any e2e tests

- explore node modules caching
- tweaks to make CI as fast as possible
- think about the structure ( what run in parallel, what in sequence etc)

#### CD

- main branch is automatically deployed to development enviroment
- tags (v1.2.3) are deployed to production enviroment
