import { describe, expect, it } from 'vitest';

import { getStageLayout } from '../../src/ui/getStageLayout';

describe('getStageLayout', () => {
  it('uses side-by-side layout for landscape videos', () => {
    expect(getStageLayout(1920, 1080)).toBe('side-by-side');
  });

  it('uses stacked layout for portrait videos', () => {
    expect(getStageLayout(1080, 1920)).toBe('stacked');
  });

  it('falls back to stacked layout when metadata is missing', () => {
    expect(getStageLayout(0, 0)).toBe('stacked');
  });
});
