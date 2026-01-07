# profiq reference app architecture

## Goal

The goal of this project is to build a reference project & architecture for all our future project. Meaning we want to have everything in this project correct.
And it will be inspiration for all the future projects. 

There will be 4 main components of this project:
- FE (React SPA)
- BE (NestJS with SQL based DB)
- CI / CD (Gitlab CI pipelines ) & git management 
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
  - Few simple components with ShadCN + Tailwind for styling 
- Authorization -- google firebase Authorization - allow only @profiq.com emails to login 
- Features:
    - Login to the app
    - Display a list of "items" from the DB 
    - Navigate to a different tab 
- Stretch goals:
    - e2e test automation with Playwright 
- Deployment
    - Deployed to Firebase hosting 

### BE 
...

### CI / CD & Git management
#### Git flow 
- main branch (we never push directly to the main branch)
  - we don't have any development branch or anything like that 
- Features branches 
    - For new things we create feature branches - and then we create merge request where CI runs 


