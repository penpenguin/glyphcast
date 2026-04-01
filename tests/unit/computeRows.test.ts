import { describe, expect, it } from 'vitest';

import { computeRows } from '../../src/video/computeRows';

describe('computeRows', () => {
  it('computes rows from aspect ratio and cell geometry', () => {
    expect(computeRows(1920, 1080, 96, 8, 16)).toBe(27);
  });

  it('never returns less than one row', () => {
    expect(computeRows(1920, 1080, 1, 0.01, 1000)).toBe(1);
  });
});
