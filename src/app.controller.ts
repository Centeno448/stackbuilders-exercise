import { Controller, Get, Render, Query, Logger } from '@nestjs/common';
import { type AppRootViewModel } from './interfaces/app-root-viewmodel';
import { WebCrawlerService } from './webcrawler.service';
import { PostService } from './post.service';
import { type PostFilter } from './interfaces/post-filter';
import { FilterValidationPipe } from './pipes/filter-validation.pipe';
import { DBService } from './db.service';

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
    @Query('filter', new FilterValidationPipe()) filter?: PostFilter,
  ): Promise<AppRootViewModel> {
    await this.dbService.registerRequest(filter);

    const viewModel: AppRootViewModel = { posts: [], error: false };

    try {
      const posts = await this.webCrawlerService.scrapePosts();
      viewModel.posts = posts;

      if (filter) {
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
      this.logger.error(`Failed to render posts. ${e}`);
      viewModel.error = true;
    }

    return viewModel;
  }
}
