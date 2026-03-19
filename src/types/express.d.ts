import { UUID } from 'crypto';

declare module 'express' {
  interface Request {
    requestId?: UUID;
  }
}
