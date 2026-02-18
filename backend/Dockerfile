FROM node:22.21.1-alpine AS build

WORKDIR /app

COPY package-lock.json .
COPY package.json .
COPY backend backend

RUN npm ci

RUN npm run -w backend build

RUN npm prune --omit=dev -w backend

FROM node:22.21.1-alpine

WORKDIR /app

COPY --from=build /app/package-lock.json .

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/backend/node_modules backend/node_modules
COPY --from=build /app/backend/dist backend/dist


CMD ["node", "backend/dist/main.js"]
