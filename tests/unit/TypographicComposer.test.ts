import { describe, expect, it } from 'vitest';

import { composeTypographic } from '../../src/compose/TypographicComposer';
import type { GlyphCatalog, GlyphMetric } from '../../src/types';

function makeGlyph(char: string, width: number, density: number): GlyphMetric {
  return {
    key: char,
    char,
    font: '16px Georgia',
    width,
    density,
  };
}

function createCatalog(candidates: GlyphMetric[]): GlyphCatalog {
  return {
    glyphs: candidates,
    byLuma: Array.from({ length: 256 }, () => candidates),
    averageWidth: 5,
    monoFont: '16px Georgia',
  };
}

describe('composeTypographic', () => {
  it('chooses glyphs whose cumulative width best matches the row width target', () => {
    const catalog = createCatalog([
      makeGlyph('i', 3, 0.5),
      makeGlyph('m', 7, 0.5),
    ]);

    const rows = composeTypographic(
      {
        cols: 2,
        rows: 1,
        luma: new Float32Array([0.5, 0.5]),
      },
      catalog,
      14,
      4,
    );

    expect(rows).toEqual([[{ text: 'mm', x: 0, font: '16px Georgia' }]]);
  });

  it('uses beamWidth=1 as a greedy search over the available candidates', () => {
    const catalog = createCatalog([
      makeGlyph('.', 4, 0.5),
      makeGlyph('#', 8, 0.5),
    ]);

    const rows = composeTypographic(
      {
        cols: 2,
        rows: 1,
        luma: new Float32Array([0.5, 0.5]),
      },
      catalog,
      16,
      1,
    );

    expect(rows[0][0]?.text).toBe('##');
  });

  it('always returns one single-font run per row in MVP mode', () => {
    const catalog = createCatalog([
      makeGlyph('a', 5, 0.2),
      makeGlyph('b', 5, 0.8),
    ]);

    const rows = composeTypographic(
      {
        cols: 3,
        rows: 2,
        luma: new Float32Array([0.2, 0.2, 0.8, 0.8, 0.2, 0.8]),
      },
      catalog,
      15,
      2,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveLength(1);
    expect(rows[1]).toHaveLength(1);
    expect(rows[0][0]?.text).toHaveLength(3);
    expect(rows[1][0]?.text).toHaveLength(3);
    expect(rows[0][0]?.font).toBe('16px Georgia');
  });

  it('centers a row when the chosen text is narrower than the target width', () => {
    const catalog = createCatalog([
      makeGlyph('i', 3, 0.5),
      makeGlyph('m', 7, 0.5),
    ]);

    const rows = composeTypographic(
      {
        cols: 2,
        rows: 1,
        luma: new Float32Array([0.5, 0.5]),
      },
      catalog,
      16,
      4,
    );

    expect(rows[0][0]?.text).toBe('mm');
    expect(rows[0][0]?.x).toBe(1);
  });
});
