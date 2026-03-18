import { Post } from './post';

export interface AppRootViewModel {
  posts: Post[];
  error: boolean;
}
