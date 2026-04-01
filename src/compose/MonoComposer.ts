import type { GlyphCatalog, SampleGrid } from '../types';

export function composeMono(grid: SampleGrid, catalog: GlyphCatalog): string[] {
  const rows: string[] = [];

  for (let y = 0; y < grid.rows; y += 1) {
    let row = '';

    for (let x = 0; x < grid.cols; x += 1) {
      const value = grid.luma[y * grid.cols + x];
      const glyph = catalog.byLuma[Math.round(value * 255)]?.[0];
      row += glyph?.char ?? ' ';
    }

    rows.push(row);
  }

  return rows;
}
