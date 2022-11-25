FROM node:18.12.1-slim

WORKDIR /rootDir

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY src/ ./src/

RUN yarn install --ignore-engines


##ENTRYPOINT [ "yarn", "prod" ]