FROM node:22.21.1-trixie
RUN apt-get update && apt-get -y install openjdk-21-jre
WORKDIR /tmp/app
COPY . .
RUN npm ci
RUN npm run init:playwright -w frontend
