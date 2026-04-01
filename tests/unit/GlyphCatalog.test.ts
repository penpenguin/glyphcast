import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureFontLoaded: vi.fn(async () => undefined),
  estimateDensity: vi.fn((char: string) => (char === ' ' ? 0 : 1)),
  measureGlyphWidth: vi.fn((char: string) => (char === ' ' ? 4 : 8)),
}));

vi.mock('../../src/glyph/ensureFontLoaded', () => ({
  ensureFontLoaded: mocks.ensureFontLoaded,
}));

vi.mock('../../src/glyph/estimateDensity', () => ({
  estimateDensity: mocks.estimateDensity,
}));

vi.mock('../../src/glyph/measureGlyphWidth', () => ({
  measureGlyphWidth: mocks.measureGlyphWidth,
}));

import { buildGlyphCatalog } from '../../src/glyph/GlyphCatalog';

describe('buildGlyphCatalog', () => {
  beforeEach(() => {
    mocks.ensureFontLoaded.mockClear();
    mocks.estimateDensity.mockClear();
    mocks.measureGlyphWidth.mockClear();
  });

  it('loads the font before measuring glyphs and builds lookup tables', async () => {
    const catalog = await buildGlyphCatalog({
      mode: 'typographic',
      cols: 96,
      fontFamily: 'Georgia',
      fontSize: 16,
      lineHeight: 18,
      palette: ' @',
      invert: false,
      beamWidth: 6,
      candidatesPerCell: 2,
      densityCanvasSize: 64,
      displayScale: 0.5,
    });

    expect(mocks.ensureFontLoaded).toHaveBeenCalledWith('16px "Georgia"', ' @');
    expect(mocks.measureGlyphWidth).toHaveBeenNthCalledWith(1, ' ', '16px "Georgia"', 18);
    expect(mocks.measureGlyphWidth).toHaveBeenNthCalledWith(2, '@', '16px "Georgia"', 18);
    expect(mocks.estimateDensity).toHaveBeenCalledTimes(2);
    expect(catalog.glyphs).toHaveLength(2);
    expect(catalog.byLuma).toHaveLength(256);
    expect(catalog.byLuma[0]).toHaveLength(2);
    expect(catalog.averageWidth).toBe(6);
    expect(catalog.monoFont).toBe('16px "Georgia"');
  });
});
