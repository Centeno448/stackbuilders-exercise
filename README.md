# Stackbuilders Exercise

## Description

Simple NestJS web app that scrapes the 30 front-page posts on https://news.ycombinator.com/ and displays them in a table. You can apply the following filters:

- Filter entries with more than five words in the title, ordered by the number of comments.
- Filter entries with less than or equal to five words in the title, ordered by points.

Posts are cached (by default for 1 minute, can be configured with the `CACHE_TTL` environment variable) so that subsequent requests are faster and do not scrape the ycombinator news site again until the cache expires.

## Compile and run the project

### Docker

```bash
# runs app in production mode
$ docker-compose up -d
```

After running this command the app should be accesible on http://localhost:3000 and a pgAdmin instance on http://localhost:3100 if you want to look at persisted data.

The pgAdmin instance may take a bit longer to initialize, check the container logs if it doesn't respond.

pgAdmin credentials:

- email: admin@admin.com
- password: admin

The database should already be accesible under the general `Servers` group.

To view table data navigate to `Servers > Databases > sb-ex-db > Schemas > public > Tables > requests`

### Manually

You will need a postgres instance running and to create a `.env` file. You can use the `.env.example` as a base.

```bash
$ npm install
```

then

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov

# e2e tests
# for these tests you will need to have a postgres instance running and internet access
# since it actually does the web scraping and writes to the DB
$ npm run test:e2e
```
