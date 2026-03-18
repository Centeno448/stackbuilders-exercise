import * as z from 'zod';

export const ZPostFilter = z.enum(['less', 'more']);

export type PostFilter = z.infer<typeof ZPostFilter>;
