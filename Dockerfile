FROM node:24.10.0-alpine

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

RUN npm run build

ENTRYPOINT [ "npm", "run", "start:prod" ]
