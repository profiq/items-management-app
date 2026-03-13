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

To use images, you need to specify the bucket name with

```
GOOGLE_STORAGE_BUCKET=
```

You can use storage emulator for local dev using env variable. The emulator can be started with `npm run -w backend firebase:emulator:storage`

```
FIREBASE_STORAGE_EMULATOR_HOST=
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

## Secrets

The following environment variables are considered "secrets" and are stored in GCP Secrets Manager

```
DB_PASSWORD
DB_USERNAME
DB_HOST
DB_DATABASE
GOOGLE_CLIENT_EMAIL
GOOGLE_PRIVATE_KEY
```

To add a new value of any of these you can use

```shell
echo "new-value" | gcloud secrets versions add <SECRET_NAME> --data-file=-
```

You also need to destroy the old secret version due to billing

First list the versions

```shell
gcloud secrets versions list <SECRET_NAME>
```

Then destroy the non-latest one:

```shell
gcloud secrets versions destroy <VERSION> --secret=<SECRET_NAME>
```

You can use the [GCP console](https://console.cloud.google.com) instead. There, select the project, search for "Secret Manager". Then, click on the secret you want to add a version to (or "Create secret" if creating a new secret and fill out the form) and click on "New version". After filling out the form, select the old secret and destroy it.

---

# Architecture

There are four components in the architecture of the project:

- FE - React SPA
- BE - NestJS + SQL-based DB
- CI / CD - GitLab CI pipelines
- Google Cloud deployment - one project for dev, one for prod

All the secrets are kept in environment variables loaded from `.env` file in the root on startup.

---

# Tech Stack

## Global

- [Node.js](https://nodejs.org/en) - JavaScript runtime for servers and CLI.
- [npm](https://docs.npmjs.com/) - Node.js default package manager.
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with added type safety and checking.
- [Prettier](https://prettier.io/docs/) - JavaScript formatter.
- [ESLint](https://eslint.org/docs/latest/) - A JavaScript linter.
- [Husky](https://typicode.github.io/husky/) - A git hook software ensuring both prettier and ESLint run and pass before any commit.

## Frontend

- [React SPA (Single page application)](https://react.dev/reference/react) - A JavaScript library allowing for state sync, context and rendering.
- [Vite](https://vite.dev/guide/) - Node.js build tool for setup and buiding of the resulting file.
- [ShadCN](https://ui.shadcn.com/docs) - React library for reusable components.
- [Vitest](https://vitest.dev/guide/) - Testing library for unit and component tests.
- [Tailwind](https://tailwindcss.com/docs/styling-with-utility-classes) - We Tailwind for styling.
- [Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/overview) - Backend data fetching and caching library.
- [React Router](https://reactrouter.com/start/declarative/routing) - React library for routing. We use declarative mode.
- [Firebase](https://firebase.google.com/docs/auth) - For getting the auth token using Google OAuth2.

## Backend

- [NestJS](https://docs.nestjs.com/) - Node.js web framework. We use Express as the backend.
- [OpenAPI](https://swagger.io/specification/) - Rest API specification, used to define and specify each endpoint and its response using a JSON schema.
- [Swagger UI](https://swagger.io/docs/) - Helps us vizualize and send out requests to the backend according to the OpenAPI specification.
- [TypeORM](https://docs.nestjs.com/techniques/database) or [here](https://typeorm.io/docs/getting-started/) - An ORM system with first-class support from NestJS.
- Database - We use an SQL database.
  - [SQLite](https://www.sqlite.org/) - For development; a local embedded (single-file/in-memory) database.
  - [MariaDB](https://mariadb.com/) - For production; a highly scalable client-server RDBMS.
- [Jest](https://jestjs.io/docs/getting-started) - Testing library for Node.js.
- [Supertest](https://www.npmjs.com/package/supertest) - Library for simulating HTTP requests and testing HTTP responses. Used in E2E tests.
- [Google Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) - For creating emulated accounts during e2e testing.
- [Firebase Admin SDK](https://firebase.google.com/docs/reference/admin) - Allows validation of JWT tokens signed by Google.
- [Google Workspace API](https://developers.google.com/workspace) - For obtaining the employee data.

## CI/CD, Deployment

- [GitLab CI](https://docs.gitlab.com/ci/) - for CI/CD we use GitLab's native `.gitlab-ci.yml`.
- [Firebase Hosting](https://firebase.google.com/docs/hosting) - for hosting the frontend
- [Cloud Run](cloud.google.com/run) - for hosting the backend
- [Artifact Registry](https://docs.cloud.google.com/artifact-registry/docs/overview) - for hosting the backend images

---

# CI/CD

## GitLab CI

For CI/CD purposes we use GitLab CI using `.gitlab-ci.yml`.

## Defaults

We use the following defaults:

```yaml
default:
  image: node:22.21.1
  tags:
    - profiq
#  # cache is disabled due to slowdown it causes in this small pipeline
#  # but on bigger projects, it can be beneficial to enable. The way to enable
#  # it can be found in the comments
#  cache: &default_cache
#    key:
#      files:
#        - 'package-lock.json'
#        - '**/package.json'
#    paths:
#      - .npm
#    policy: pull
```

- `image` - default OCI (/Docker) image
- `tags` - run jobs on profiq runners
- `cache` - commented out due to low performance, uses zip and download/upload
- `&default_cache` - [YAML anchor](https://docs.gitlab.com/ci/yaml/yaml_optimization/#anchors), allows part to be used elsewhere with merge

## Globals

```yaml
stages:
  - code_quality
  - test

variables:
  GIT_DEPTH: 1
```

- `stages` - specify order, run sequentially, jobs in one stage run in parallel
- `GIT_DEPTH` - how many commits should the runner clone

## Reusable blocks

```yaml
.set_npm_config:
  before_script:
    - npm config set cache .npm
    - npm config set prefer-offline true

.rule_mr_and_main:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"

.npm_ci_only_root:
  before_script:
    - !reference [.set_npm_config, before_script]
    - npm ci --workspaces=false

.npm_ci_frontend:
  before_script:
    - !reference [.set_npm_config, before_script]
    - npm ci -w frontend --include-workspace-root

.npm_ci_backend:
  before_script:
    - !reference [.set_npm_config, before_script]
    - npm ci -w backend --include-workspace-root
```

This part specifies multiple blocks that are used elsewhere using extends, so that their change happens in only one place instead of in multiple spaces. `!reference` allows to reference a part of another block and merge it instead of overwriting it.

## Code Quality

```yaml
code_quality:
  stage: code_quality
  extends:
    - .rule_mr_and_main
    - .npm_ci_only_root
  script:
    - npm run lint:eslint
    - npm run lint:prettier
```

This job ensures code quality. As it extends `.rule_mr_and_main` and `.npm_ci_only_root`, it inherits their properties. After resolving it would look like the following code

```yaml
code_quality:
  stage: code_quality
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main"
  before_script:
    - npm config set cache .npm
    - npm config set prefer-offline true
    - npm ci --workspaces=false
  script:
    - npm run lint:eslint
    - npm run lint:prettier
```

## Tests

```yaml
frontend-test:
  stage: test
  extends:
    - .rule_mr_and_main
    - .npm_ci_frontend
  script:
    - !reference [.npm_ci_frontend, before_script]
    # if unit tests fail, there is no reason to waste time installing playwright
    # so run it first
    - npm run test:unit -w frontend
    - npm run init:playwright -w frontend
    - npm run test:component -w frontend

backend-unit:
  stage: test
  extends:
    - .rule_mr_and_main
    - .npm_ci_backend
  script:
    - npm run test -w backend

backend-e2e:
  stage: test
  extends:
    - .rule_mr_and_main
    - .npm_ci_backend
  script:
    - npm run test:e2e-emulator -w backend
```

All the tests are in the same stage, so they run in parallel, thus ensuring higher performance. As you can see, `!reference` can be used directly in the script.

## Changelog Update

```yaml
update_changelog:
  stage: update_changelog
  rules:
    - if: $CI_COMMIT_TAG
  variables:
    # disable shallow clone
    GIT_DEPTH: 0
  before_script:
    - npm ci --workspaces=false
    - git config user.name "gitlab-ci"
    - git config user.email "gitlab-ci@example.invalid"
    # ensure we do not have local tags
    - git fetch --prune --prune-tags
    - git switch main
    - git reset --hard origin/main

  script:
    - npm version --no-git-tag-version "${CI_COMMIT_TAG}"
    # the changelog generator expects the workflow to follow tag after bump,
    # so delete the local version of the tag
    - git tag -d "${CI_COMMIT_TAG}"
    - npm run changelog:update
    - git add .
    - 'git commit -m "chore(changelog): update changelog to ${CI_COMMIT_TAG}"'
    - git push origin HEAD:main
    - npm run --silent changelog:stdout > changes.md
    - git tag "${CI_COMMIT_TAG}"
    - git push --force --tags
  artifacts:
    when: on_success
    access: all
    expire_in: '30 minutes'
    paths:
      - changes.md

update_release_notes:
  image: registry.gitlab.com/gitlab-org/cli:latest
  needs:
    - update_changelog
  rules:
    - if: $CI_COMMIT_TAG
  stage: update_changelog
  script:
    - glab auth login --hostname $CI_SERVER_HOST --job-token $CI_JOB_TOKEN
    - glab release create "${CI_COMMIT_TAG}" -F changes.md
```

This stage updates the changelog both in the repository ([CHANGELOG.md](CHANGELOG.md)) and in the release notes. GitLab checks if the tag originated from a CI/CD pipeline and ignores it if it did, so no cycle happens.

## Diagram

```mermaid
flowchart LR
    subgraph sub_cq[code_quality]
    node_cq[code_quality]
    end
    style node_cq fill:cyan,color:black

    subgraph sub_test[test]
        direction LR
        node_fe_test[frontend-test +]
        node_be_test_unit[backend-unit *]
        node_be_test_e2e[backend-e2e *]
    end
    sub_cq --> sub_test
    style node_fe_test fill:cyan,color:black
    style node_be_test_unit fill:cyan,color:black
    style node_be_test_e2e fill:cyan,color:black


    subgraph sub_build[build]
        direction LR
        node_be_build[backend-build *]
        node_fe_build_dev[frontend-build-dev +]
        node_fe_build_prod[frontend-build-production]
    end
    sub_test --> sub_build
    style node_fe_build_dev fill:cyan,color:black
    style node_be_build fill:orange,color:black
    style node_fe_build_prod fill:lightgreen,color:black

    subgraph sub_deploy[deploy]
        direction LR
        node_fe_deploy_dev[frontend-deploy-dev +]
        node_be_deploy_dev[backend-deploy-dev *]
        node_be_deploy_prod[backend-deploy-production]
        node_fe_deploy_prod[frontend-deploy-production]
    end

    node_be_build --> node_be_deploy_dev
    node_be_build --> node_be_deploy_prod
    node_fe_build_dev --> node_fe_deploy_dev
    node_fe_build_prod --> node_fe_deploy_prod

    style node_fe_deploy_prod fill:lightgreen,color:black
    style node_be_deploy_prod fill:lightgreen,color:black

    style node_fe_deploy_dev fill:orange,color:black
    style node_be_deploy_dev fill:orange,color:black
```

- **Cyan** jobs run when a tag is created, when a commit lands in main or when a merge request has new commits.

- **Orange** jobs run when a commit lands in main or when the user specifically runs them in merge request.

- **Green** jobs run when a tag is created.

- A "+" means that the job only runs if something on the frontend has been changed.

- A "\*" means that the job only runs if something on the backend has been changed.

---

# Integrations

## Auth

- For authentication we used [Firebase Auth](https://firebase.google.com/docs/auth)
- We obtain a JWT token signed by google, and add it to the headers of requests sent out to the backend
- Implementation:
  - [backend/src/auth/auth.guard.ts](backend/src/auth/auth.guard.ts)
  - [frontend/src/lib/providers/auth/AuthProvider.tsx](frontend/src/lib/providers/auth/AuthProvider.tsx)
  - [frontend/src/lib/api_client/api_client.ts](frontend/src/lib/api_client/api_client.ts)

## Google Workspace Api

- We use Google Workspace API to get list of a employees and to get information about a specific employee of the company.
- For security, we use a service account with delegation and read-only permissions for the [users methods](https://developers.google.com/workspace/admin/directory/reference/rest/v1/users).
- Implementation:
  - [backend/src/employee/employee.service.ts](backend/src/employee/employee.service.ts)
- For general information about integration in projects, see the [Infrastructure wiki](https://gitlab.com/profiq/all/infra/infra/-/wikis/Integrations/Google-Workspace-Integration)

## Google Cloud Storage

- We use Google Cloud Storage for storing the pet images in a [Bucket](https://docs.cloud.google.com/storage/docs/buckets)
- Implementation:
  - [backend/src/firebase/firebase.service.ts](backend/src/firebase/firebase.service.ts)
  - [backend/src/office_pet/office_pet.service.ts](backend/src/office_pet/office_pet.service.ts#L71)

## Database

- We use TypeORM as the database access layer
- We store the users (people who logged in or have an associated pet), office pets and the pets' visits in the DB
- We use decorators in the entities
- On production, we use [migrations](https://typeorm.io/docs/migrations/why/) for synchronization. On local dev, we use the [synchronize](https://typeorm.io/docs/help/faq/#how-do-i-update-a-database-schema) option
- The production database is hosted at [Hostinger](https://www.hostinger.com/)
- Implementation:
  - [backend/src/user/user.entity.ts](backend/src/user/user.entity.ts)
  - [backend/src/office_pet/office_pet.entity.ts](office_pet/office_pet.entity.ts)
  - [backend/src/pet_visit/pet_visit.entity.ts](backend/src/pet_visit/pet_visit.entity.ts)
  - [backend/src/datasource.ts](backend/src/datasource.ts)

### Migrations

- To manually run migrations against the database specified in environment variables, use `npm run migrations:run -w backend`. This is also done automatically at backend startup when using MariaDB
- To generate new migrations from the data added to `*.entity.ts` files on the backend, use `npm run migrations:generate -w backend`. This also needs the previous migrations to be applied as per the previous point
- To revert the newest migration, use `npm run migrations:rollback -w backend`

### Transactions

- For cases where there are multiple database operations and any one's failure should rollback, we use [transactions](https://typeorm.io/docs/advanced-topics/transactions/)
- Implementation:
  - [backend/src/pet_visit/pet_visit.service.ts](backend/src/pet_visit/pet_visit.service.ts#L27)

## Protected Page

- On the frontend, we use a component to protect the auth-only pages. If an unauthorized user attempts to access such a page, they get redirected to login
- On the backend, this is enforced using a [Guard](https://docs.nestjs.com/guards) and a JWT signature check
- Implementation:
  - [frontend/src/components/ProtectedRoute.tsx](frontend/src/components/ProtectedRoute.tsx)
  - [backend/src/auth/auth.guard.ts](backend/src/auth/auth.guard.ts)
  - [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)

## Forms

- For forms we use [React Hook Form](https://react-hook-form.com/) and for their validation we use [Zod](https://zod.dev/)
- Implementation:
  - [frontend/src/routes/PetCreate.tsx](frontend/src/routes/PetCreate.tsx#L31)
  - [frontend/src/routes/PetUpdate.tsx](frontend/src/routes/PetUpdate.tsx#L34)

### Interceptors

- For ensuring the employee is created in the DB when a pet create or update request is fired, we use an [interceptor](https://docs.nestjs.com/interceptors)
- Implementation:
  - [backend/src/employee_hydration/employee_hydration.interceptor.ts](backend/src/employee_hydration/employee_hydration.interceptor.ts)

---

# Database diagram

```mermaid
erDiagram
    User ||--o{OfficePet: has
    User {
        int id PK
        string name "The employee's name"
        string employee_id UK "The employee's ID in Google Workspace"
    }

    OfficePet || --o{PetVisit: does
    OfficePet {
        int id PK
        string name "The pet's name"
        string species "The pet's species"
        string race "The pet's race"
        int ownerId FK "The owner user's id"
    }

    PetVisit {
        int id PK
        date date "The date of the pet's visit"
        int petId FK "Pet's id; UNIQUE(date, petId)"
    }
```

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
