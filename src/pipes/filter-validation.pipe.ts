import { PipeTransform, Injectable } from '@nestjs/common';
import { type PostFilter, ZPostFilter } from '../interfaces/post-filter';

@Injectable()
export class FilterValidationPipe implements PipeTransform {
  transform(value: any): PostFilter | undefined {
    const res = ZPostFilter.safeParse(value);

    if (res.success) {
      return res.data;
    }

    return undefined;
  }
}
