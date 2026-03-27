FROM node:22.21.1-trixie
# Versions of glab and auggie are pinned to allow easy rollback
RUN apt-get update && apt-get -y install openjdk-21-jre curl && \
    ARCH=$(dpkg --print-architecture) && \
    curl -Lo /tmp/glab.deb https://gitlab.com/gitlab-org/cli/-/releases/v1.89.0/downloads/glab_1.89.0_linux_${ARCH}.deb && \
    apt-get -y install /tmp/glab.deb && \
    rm /tmp/glab.deb && \
    npm install -g @augmentcode/auggie@0.20.0
WORKDIR /tmp/app
COPY . .
RUN npm ci && \
    npm run init:playwright -w frontend
