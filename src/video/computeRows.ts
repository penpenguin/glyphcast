export function computeRows(
  videoWidth: number,
  videoHeight: number,
  cols: number,
  cellWidth: number,
  lineHeight: number,
): number {
  return Math.max(
    1,
    Math.round((cols * cellWidth * videoHeight) / (lineHeight * videoWidth)),
  );
}
