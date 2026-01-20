# profiq reference app architecture

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
