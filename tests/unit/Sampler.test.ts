import { describe, expect, it } from 'vitest';

import { imageDataToLumaGrid } from '../../src/video/Sampler';

describe('imageDataToLumaGrid', () => {
  it('converts pixels into Rec.709 luma values', () => {
    const image = new ImageData(
      new Uint8ClampedArray([
        255, 0, 0, 255,
        0, 255, 0, 255,
      ]),
      2,
      1,
    );

    const grid = imageDataToLumaGrid(image, false);

    expect(grid.cols).toBe(2);
    expect(grid.rows).toBe(1);
    expect(grid.luma[0]).toBeCloseTo(0.2126, 4);
    expect(grid.luma[1]).toBeCloseTo(0.7152, 4);
  });

  it('supports inverted brightness', () => {
    const image = new ImageData(
      new Uint8ClampedArray([255, 255, 255, 255]),
      1,
      1,
    );

    const grid = imageDataToLumaGrid(image, true);

    expect(Array.from(grid.luma)).toEqual([0]);
  });
});
