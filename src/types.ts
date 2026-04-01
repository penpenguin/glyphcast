export type RenderMode = 'mono' | 'typographic';

export interface Settings {
  mode: RenderMode;
  cols: number;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  palette: string;
  invert: boolean;
  beamWidth: number;
  candidatesPerCell: number;
  densityCanvasSize: number;
  displayScale: number;
}

export interface GlyphMetric {
  key: string;
  char: string;
  font: string;
  width: number;
  density: number;
}

export interface GlyphCatalog {
  glyphs: GlyphMetric[];
  byLuma: GlyphMetric[][];
  averageWidth: number;
  monoFont: string;
}

export interface SampleGrid {
  cols: number;
  rows: number;
  luma: Float32Array;
}

export interface RowRun {
  text: string;
  x: number;
  font: string;
}

export interface ComposedFrame {
  rows: RowRun[][];
}
