import { ensureFontLoaded } from './ensureFontLoaded';
import { estimateDensity } from './estimateDensity';
import { measureGlyphWidth } from './measureGlyphWidth';
import type { GlyphCatalog, GlyphMetric, Settings } from '../types';

function nearestByDensity(glyphs: GlyphMetric[], luma01: number, count: number): GlyphMetric[] {
  return [...glyphs]
    .sort((left, right) => Math.abs(left.density - luma01) - Math.abs(right.density - luma01))
    .slice(0, count);
}

export async function buildGlyphCatalog(settings: Settings): Promise<GlyphCatalog> {
  const font = `${settings.fontSize}px "${settings.fontFamily}"`;

  await ensureFontLoaded(font, settings.palette);

  const glyphs: GlyphMetric[] = [...settings.palette].map((char) => ({
    key: `${font}::${char}`,
    char,
    font,
    width: measureGlyphWidth(char, font, settings.lineHeight),
    density: estimateDensity(char, font, settings.densityCanvasSize),
  }));

  const byLuma = Array.from({ length: 256 }, (_, index) =>
    nearestByDensity(glyphs, index / 255, Math.max(settings.candidatesPerCell, 1)),
  );
  const averageWidth =
    glyphs.reduce((sum, glyph) => sum + glyph.width, 0) / Math.max(glyphs.length, 1);

  return {
    glyphs,
    byLuma,
    averageWidth,
    monoFont: font,
  };
}
