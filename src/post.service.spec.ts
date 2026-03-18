import { Test, TestingModule } from '@nestjs/testing';

import { PostService } from './post.service';
import { Post } from './interfaces/post';

describe('PostService', () => {
  let postService: PostService;

  const posts: Post[] = [
    {
      title: 'post one with more than five-words',
      comments: 10,
      number: 1,
      points: 2,
    },
    {
      title: 'post two with more than five-words',
      comments: 12,
      number: 1,
      points: 6,
    },
    {
      title: 'post three with more than five-words',
      comments: 2,
      number: 1,
      points: 10,
    },
    {
      title: 'post one with less five',
      comments: 1,
      number: 1,
      points: 5,
    },
    {
      title: 'post two with less five',
      comments: 10,
      number: 1,
      points: 10,
    },
    {
      title: 'post three with less-five',
      comments: 4,
      number: 1,
      points: 2,
    },
    {
      title: 'post four with less-five',
      comments: 13,
      number: 1,
      points: 7,
    },
  ];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [PostService],
    }).compile();

    postService = app.get<PostService>(PostService);
  });

  describe('filterMoreThanFiveWords', () => {
    it('filters correctly', () => {
      const res = postService.filterMoreThanFiveWords(posts);

      expect(res.length).toBe(3);
    });

    it('orders by comments in ascending order', () => {
      const res = postService.filterMoreThanFiveWords(posts);

      expect(res).toEqual([posts[2], posts[0], posts[1]]);
    });

    it('returns empty list when input is empty list', () => {
      const res = postService.filterMoreThanFiveWords([]);

      expect(res).toBeDefined();
      expect(res.length).toBe(0);
    });
  });

  describe('filterLessThanOrEqualToFiveWords', () => {
    it('filters correctly', () => {
      const res = postService.filterLessThanOrEqualToFiveWords(posts);

      expect(res.length).toBe(4);
    });

    it('orders by points in ascending order', () => {
      const res = postService.filterLessThanOrEqualToFiveWords(posts);

      expect(res).toEqual([posts[5], posts[3], posts[6], posts[4]]);
    });

    it('returns empty list when input is empty list', () => {
      const res = postService.filterLessThanOrEqualToFiveWords([]);

      expect(res).toBeDefined();
      expect(res.length).toBe(0);
    });
  });
});
