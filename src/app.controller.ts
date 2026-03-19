import { Controller, Get, Render, Query, Logger, Req } from '@nestjs/common';
import { type AppRootViewModel } from './interfaces/app-root-viewmodel';
import { WebCrawlerService } from './webcrawler.service';
import { PostService } from './post.service';
import { type PostFilter } from './interfaces/post-filter';
import { FilterValidationPipe } from './pipes/filter-validation.pipe';
import { DBService } from './db.service';
import type { Request } from 'express';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly webCrawlerService: WebCrawlerService,
    private readonly postService: PostService,
    private readonly dbService: DBService,
  ) {}

  @Get()
  @Render('index')
  async index(
    @Req() req: Request,
    @Query('filter', new FilterValidationPipe()) filter?: PostFilter,
  ): Promise<AppRootViewModel> {
    await this.dbService.registerRequest({ filter, id: req.requestId! });

    const viewModel: AppRootViewModel = { posts: [], error: false };

    try {
      this.logger.log(`${req.requestId} - Fetching posts from web crawler.`);
      const posts = await this.webCrawlerService.scrapePosts();
      viewModel.posts = posts;

      if (filter) {
        this.logger.log(
          `${req.requestId} - Applying filter ${filter} to posts.`,
        );

        switch (filter) {
          case 'less':
            viewModel.posts =
              this.postService.filterLessThanOrEqualToFiveWords(posts);
            break;

          case 'more':
            viewModel.posts = this.postService.filterMoreThanFiveWords(posts);
            break;
        }
      }
    } catch (e: any) {
      this.logger.error(`${req.requestId} - Failed to render posts. ${e}`);
      viewModel.error = true;
    }

    return viewModel;
  }
}
