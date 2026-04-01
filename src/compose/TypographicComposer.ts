import type { GlyphCatalog, RowRun, SampleGrid } from '../types';

interface BeamState {
  text: string;
  width: number;
  densityCost: number;
  score: number;
}

export function composeTypographic(
  grid: SampleGrid,
  catalog: GlyphCatalog,
  outputWidth: number,
  beamWidth: number,
): RowRun[][] {
  const rows: RowRun[][] = [];
  const averageWidth = Math.max(catalog.averageWidth, 1);
  const beamSize = Math.max(beamWidth, 1);

  for (let y = 0; y < grid.rows; y += 1) {
    let states: BeamState[] = [
      {
        text: '',
        width: 0,
        densityCost: 0,
        score: 0,
      },
    ];

    for (let x = 0; x < grid.cols; x += 1) {
      const value = grid.luma[y * grid.cols + x] ?? 0;
      const bucket = Math.max(0, Math.min(255, Math.round(value * 255)));
      const candidates = catalog.byLuma[bucket]?.length
        ? catalog.byLuma[bucket]
        : catalog.glyphs;
      const targetPrefixWidth = ((x + 1) / grid.cols) * outputWidth;
      const nextStates: BeamState[] = [];

      for (const state of states) {
        for (const candidate of candidates) {
          const nextWidth = state.width + candidate.width;
          const densityDelta = Math.abs(candidate.density - value);
          const widthDelta = Math.abs(nextWidth - targetPrefixWidth) / averageWidth;

          nextStates.push({
            text: state.text + candidate.char,
            width: nextWidth,
            densityCost: state.densityCost + densityDelta,
            score: state.score + densityDelta + 0.25 * widthDelta,
          });
        }
      }

      nextStates.sort((left, right) => {
        if (left.score !== right.score) {
          return left.score - right.score;
        }
        if (left.width !== right.width) {
          return Math.abs(left.width - targetPrefixWidth) - Math.abs(right.width - targetPrefixWidth);
        }
        return left.densityCost - right.densityCost;
      });

      states = nextStates.slice(0, beamSize);
    }

    states.sort((left, right) => {
      const leftFinalScore = left.score + 2 * (Math.abs(left.width - outputWidth) / averageWidth);
      const rightFinalScore = right.score + 2 * (Math.abs(right.width - outputWidth) / averageWidth);

      if (leftFinalScore !== rightFinalScore) {
        return leftFinalScore - rightFinalScore;
      }
      if (left.width !== right.width) {
        return Math.abs(left.width - outputWidth) - Math.abs(right.width - outputWidth);
      }
      return left.densityCost - right.densityCost;
    });

    rows.push([
      {
        text: states[0]?.text ?? ''.padEnd(grid.cols, ' '),
        x: 0,
        font: catalog.monoFont,
      },
    ]);
  }

  return rows;
}
