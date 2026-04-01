import { describe, expect, it } from 'vitest';

import { composeMono } from '../../src/compose/MonoComposer';
import type { GlyphCatalog } from '../../src/types';

describe('composeMono', () => {
  it('maps each sampled luma to the nearest glyph', () => {
    const catalog: GlyphCatalog = {
      glyphs: [],
      byLuma: Array.from({ length: 256 }, (_, i) => [
        {
          key: `${i}`,
          char: i < 128 ? '.' : '#',
          font: '16px Georgia',
          width: 8,
          density: i / 255,
        },
      ]),
      averageWidth: 8,
      monoFont: '16px Georgia',
    };

    const rows = composeMono(
      {
        cols: 3,
        rows: 1,
        luma: new Float32Array([0.0, 0.5, 1.0]),
      },
      catalog,
    );

    expect(rows).toEqual(['.##']);
  });
});
