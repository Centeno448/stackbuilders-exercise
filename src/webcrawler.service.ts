import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { Post } from './interfaces/post';

@Injectable()
export class WebCrawlerService {
  private readonly logger = new Logger(WebCrawlerService.name);

  constructor(private readonly httpService: HttpService) {}

  private parsePost(selector: cheerio.CheerioAPI, e: any): Post {
    const number = Number(selector(e).find('.rank').text());
    const title = selector(e).find('.titleline').find('a').first().text();
    const points = Number(
      selector(e).next().find('.score').text().split(' ')[0],
    );
    const nbsp = String.fromCharCode(160);
    const comments = Number(
      selector(e).next().find('a').last().text().split(nbsp)[0],
    );

    return {
      number,
      title,
      points,
      comments,
    };
  }

  async scrapePosts(): Promise<Post[]> {
    const res = await this.httpService.axiosRef({
      url: 'https://news.ycombinator.com/',
      method: 'GET',
    });

    if (!res.data) {
      throw new Error('Failed to get posts.');
    }

    const selector = cheerio.load(res.data as string);

    const posts = selector('.submission')
      .map((_, el) => this.parsePost(selector, el))
      .get();

    return posts;
  }
}
