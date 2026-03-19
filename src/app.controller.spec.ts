import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import * as httpMocks from 'node-mocks-http';
import { randomUUID } from 'crypto';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WebCrawlerService } from './webcrawler.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Post } from './interfaces/post';
import { DBService } from './db.service';
import { PostService } from './post.service';
import { PostFilter, ZPostFilter } from './interfaces/post-filter';

describe('AppController', () => {
  let appController: AppController;
  let webCrawlerMock: DeepMockProxy<WebCrawlerService>;
  let cacheMock: DeepMockProxy<Cache>;
  let dbMock: DeepMockProxy<DBService>;

  const indexRequest = httpMocks.createRequest({
    method: 'GET',
    requestId: randomUUID(),
  });

  const mockPosts: Post[] = [
    {
      number: 1,
      title: 'title 1',
      points: 1,
      comments: 1,
    },
    {
      number: 2,
      title: 'title with more than 5 words',
      points: 1,
      comments: 1,
    },
  ];

  const cachedPosts: Post[] = [
    {
      number: 1,
      title: 'title cached 1',
      points: 1,
      comments: 1,
    },
    {
      number: 2,
      title: 'title with more than 5 words cached',
      points: 1,
      comments: 1,
    },
  ];

  const mockPostsFilterMapper = new Map<PostFilter, number>();
  mockPostsFilterMapper.set('less', 0);
  mockPostsFilterMapper.set('more', 1);

  beforeEach(async () => {
    dbMock = mockDeep<DBService>();
    cacheMock = mockDeep<Cache>();
    cacheMock.get.mockResolvedValue(undefined);
    webCrawlerMock = mockDeep<WebCrawlerService>();
    webCrawlerMock.scrapePosts.mockResolvedValue(mockPosts);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: CACHE_MANAGER,
          useValue: cacheMock,
        },
        {
          provide: WebCrawlerService,
          useValue: webCrawlerMock,
        },
        {
          provide: DBService,
          useValue: dbMock,
        },
        PostService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('index', () => {
    describe('when no post filter is specified', () => {
      it('should return all posts and no error', async () => {
        const res = await appController.index(indexRequest, undefined);
        expect(res.posts.length).toBe(2);
        expect(res.posts).toEqual(mockPosts);
        expect(res.error).toBe(false);
      });
      it('should register request in the database', async () => {
        await appController.index(indexRequest, undefined);
        const lastRegister = dbMock.registerRequest.mock.lastCall;
        expect(lastRegister?.[0].filter).toBe(undefined);
        expect(lastRegister?.[0].id).toBe(indexRequest.requestId);
      });
    });

    describe('when a post filter is specified', () => {
      for (const option of ZPostFilter.options) {
        it(`should return all posts and no error for ${option}`, async () => {
          const res = await appController.index(indexRequest, option);
          const expectedIndex = mockPostsFilterMapper.get(option)!;

          expect(res.posts.length).toBe(1);
          expect(res.posts).toEqual([mockPosts[expectedIndex]]);
          expect(res.error).toBe(false);
        });
        it(`should register request in the database for ${option}`, async () => {
          await appController.index(indexRequest, option);
          const lastRegister = dbMock.registerRequest.mock.lastCall;
          expect(lastRegister?.[0].filter).toBe(option);
          expect(lastRegister?.[0].id).toBe(indexRequest.requestId);
        });
      }
    });

    describe('when there are cached posts', () => {
      it('returns cached posts without calling web crawler', async () => {
        cacheMock.get.mockResolvedValue(cachedPosts);
        const res = await appController.index(indexRequest, undefined);

        expect(res.posts.length).toBe(2);
        expect(res.posts).toEqual(cachedPosts);
        expect(res.error).toBe(false);
        expect(webCrawlerMock.scrapePosts.mock.lastCall).not.toBeDefined();
      });
    });

    describe('when something goes wrong', () => {
      it('sets the error flag when cache lookup fails', async () => {
        cacheMock.get.mockImplementation(() => {
          throw new Error();
        });

        const res = await appController.index(indexRequest, undefined);
        expect(res.error).toBe(true);
        expect(res.posts).toEqual([]);
      });

      it('sets the error flag when web crawler fails', async () => {
        webCrawlerMock.scrapePosts.mockClear();
        webCrawlerMock.scrapePosts.mockImplementation(() => {
          throw new Error();
        });

        const res = await appController.index(indexRequest, undefined);
        expect(res.error).toBe(true);
        expect(res.posts).toEqual([]);
      });

      it('sets the error flag when db fails', async () => {
        dbMock.registerRequest.mockClear();
        dbMock.registerRequest.mockImplementation(() => {
          throw new Error();
        });

        const res = await appController.index(indexRequest, undefined);
        expect(res.error).toBe(true);
        expect(res.posts).toEqual([]);
      });
    });
  });
});
