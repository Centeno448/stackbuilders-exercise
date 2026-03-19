import { Test, TestingModule } from '@nestjs/testing';

import { HttpService } from '@nestjs/axios';
import { mock, DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WebCrawlerService } from './webcrawler.service';
import { AxiosResponse } from 'axios';
import { readFile } from 'node:fs/promises';
import { Post } from './interfaces/post';

describe('PostService', () => {
  let httpMock: DeepMockProxy<HttpService>;
  let webScraperService: WebCrawlerService;
  let fixtureContent: string;

  const expectedPosts: Post[] = [
    { number: 1, title: 'AI Coding Is Gambling', points: 58, comments: 36 },
    { number: 2, title: 'Death to Scroll Fade', points: 227, comments: 113 },
    {
      number: 3,
      title: 'Snowflake AI Escapes Sandbox and Executes Malware',
      points: 146,
      comments: 38,
    },
    {
      number: 4,
      title: 'Show HN: Will my flight have Starlink?',
      points: 0,
      comments: 21,
    },
    {
      number: 5,
      title: 'A tiny, decentralised tool to explore the small web',
      points: 88,
      comments: 0,
    },
  ];

  beforeAll(async () => {
    fixtureContent = await readFile('./test/fixtures/news-fixture.html', {
      encoding: 'utf-8',
    });
    httpMock = mockDeep<HttpService>();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: HttpService, useValue: httpMock },
        WebCrawlerService,
      ],
    }).compile();

    webScraperService = app.get<WebCrawlerService>(WebCrawlerService);
  });

  beforeEach(() => {
    const response = mock<AxiosResponse>({
      data: fixtureContent,
      status: 200,
      statusText: 'OK',
    });
    httpMock.axiosRef.mockResolvedValue(response);
  });

  describe('scrapePosts', () => {
    it('scrapes the correct amount of posts', async () => {
      const res = await webScraperService.scrapePosts();

      expect(res.length).toBe(5);
    });

    it(`parses posts correctly`, async () => {
      const res = await webScraperService.scrapePosts();

      for (let i = 0; i < expectedPosts.length; i++) {
        const { number, title, points, comments } = res[i];
        expect(number).toBe(expectedPosts[i].number);
        expect(title).toBe(expectedPosts[i].title);
        expect(points).toBe(expectedPosts[i].points);
        expect(comments).toBe(expectedPosts[i].comments);
      }
    });

    it('throws an error if no data is returned', async () => {
      const response = mock<AxiosResponse>({
        data: undefined,
        status: 200,
        statusText: 'OK',
      });
      httpMock.axiosRef.mockResolvedValueOnce(response);

      const testFn = async () => {
        await webScraperService.scrapePosts();
      };

      await expect(testFn).rejects.toThrow(
        new Error('Failed to get posts from webpage.'),
      );
    });
  });
});
