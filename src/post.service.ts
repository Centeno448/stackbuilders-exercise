import { Injectable } from '@nestjs/common';
import { Post } from './interfaces/post';

@Injectable()
export class PostService {
  private hasMoreThanFiveWords(title: string): boolean {
    return title.split(' ').length > 5;
  }

  filterMoreThanFiveWords(posts: Post[]): Post[] {
    const res = posts.filter((p) => this.hasMoreThanFiveWords(p.title));

    return res.sort((a, b) => a.comments - b.comments);
  }

  filterLessThanOrEqualToFiveWords(posts: Post[]): Post[] {
    const res = posts.filter((p) => !this.hasMoreThanFiveWords(p.title));

    return res.sort((a, b) => a.points - b.points);
  }
}
