import request from 'supertest';
import { AppModule } from './../src/app.module';
import * as cheerio from 'cheerio';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    it('returns 200', () => {
      return request(app.getHttpServer()).get('/').expect(200);
    });

    it('shows 30 posts', async () => {
      const res = await request(app.getHttpServer()).get('/');

      const selector = cheerio.load(res.text);

      expect(selector('li').length).toBe(30);
    });

    it('extracted data correctly', async () => {
      const res = await request(app.getHttpServer()).get('/');

      const selector = cheerio.load(res.text);

      const firstPost = selector('li').first();

      const firstPostText = firstPost.text().replaceAll(/[\s]+/g, ' ').trim();

      expect(firstPostText).toMatch(
        /[\d]+.\s[\w\W]+[\d]+\spoints\s[\d]+\scomments/,
      );
    });
  });
});
