import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext';

const MEASURE_WIDTH = 10000;

export function measureGlyphWidth(
  char: string,
  font: string,
  lineHeight: number,
): number {
  const prepared = prepareWithSegments(char, font, { whiteSpace: 'pre-wrap' });
  const { lines } = layoutWithLines(prepared, MEASURE_WIDTH, lineHeight);

  return lines[0]?.width ?? 0;
}
