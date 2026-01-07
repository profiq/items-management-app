# profiq reference app architecture

## Goal

The goal of this project is to build a reference project & architecture for all our future project. Meaning we want to have everything in this project correct.
And it will be inspiration for all the future projects. 

There will be 4 main components of this project:
- FE (React SPA)
- BE (NestJS with SQL based DB)
- CI / CD (Gitlab CI pipelines )
- Deployment on Google Cloud 

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
  - Tanstack query for API calls 

  ...