import { ZPostFilter } from '../interfaces/post-filter';
import { FilterValidationPipe } from './filter-validation.pipe';

describe('FilterValidationPipe', () => {
  it('returns undefined when not valid', () => {
    const pipe = new FilterValidationPipe();

    const res = pipe.transform('notvalid');

    expect(res).not.toBeDefined();
  });

  for (const option of ZPostFilter.options) {
    it(`returns the same value for ${option}`, () => {
      const pipe = new FilterValidationPipe();

      const res = pipe.transform(option);

      expect(res).toBe(option);
    });
  }
});
