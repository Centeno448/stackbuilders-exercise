import {
  Controller,
  Get,
  Render,
  Query,
  Logger,
  Req,
  Inject,
} from '@nestjs/common';
import { type AppRootViewModel } from './interfaces/app-root-viewmodel';
import { WebCrawlerService } from './webcrawler.service';
import { PostService } from './post.service';
import { type PostFilter } from './interfaces/post-filter';
import { FilterValidationPipe } from './pipes/filter-validation.pipe';
import { DBService } from './db.service';
import type { Request } from 'express';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Post } from './interfaces/post';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private readonly POST_CACHE_KEY = 'posts';

  constructor(
    private readonly webCrawlerService: WebCrawlerService,
    private readonly postService: PostService,
    private readonly dbService: DBService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @Render('index')
  async index(
    @Req() req: Request,
    @Query('filter', new FilterValidationPipe()) filter?: PostFilter,
  ): Promise<AppRootViewModel> {
    const viewModel: AppRootViewModel = { posts: [], error: false };

    try {
      await this.dbService.registerRequest({ filter, id: req.requestId! });

      const cachedPosts = await this.cacheManager.get<Post[]>(
        this.POST_CACHE_KEY,
      );

      if (!cachedPosts) {
        this.logger.log(
          `${req.requestId} - No cached posts, fetching posts from web crawler.`,
        );
        viewModel.posts = await this.getPostsFromWebCrawler();
      } else {
        this.logger.log(`${req.requestId} - Retrieved posts from cache.`);
        viewModel.posts = cachedPosts;
      }

      if (filter) {
        this.logger.log(
          `${req.requestId} - Applying filter '${filter}' to posts.`,
        );
        viewModel.posts = this.applyFilter(filter, viewModel.posts);
      }
    } catch (e: any) {
      this.logger.error(`${req.requestId} - Failed to render posts. ${e}`);
      viewModel.error = true;
    }

    return viewModel;
  }

  private async getPostsFromWebCrawler(): Promise<Post[]> {
    const posts = await this.webCrawlerService.scrapePosts();
    await this.cacheManager.set(this.POST_CACHE_KEY, posts);
    return posts;
  }

  private applyFilter(filter: PostFilter, posts: Post[]): Post[] {
    switch (filter) {
      case 'less':
        return this.postService.filterLessThanOrEqualToFiveWords(posts);

      case 'more':
        return this.postService.filterMoreThanFiveWords(posts);
    }
  }
}
