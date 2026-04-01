import type { SampleGrid } from '../types';

export function imageDataToLumaGrid(
  image: ImageData,
  invert: boolean,
): SampleGrid {
  const { width: cols, height: rows, data } = image;
  const luma = new Float32Array(cols * rows);

  for (let index = 0, pixel = 0; index < luma.length; index += 1, pixel += 4) {
    const r = data[pixel] / 255;
    const g = data[pixel + 1] / 255;
    const b = data[pixel + 2] / 255;

    let value = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (invert) {
      value = 1 - value;
    }

    luma[index] = value;
  }

  return {
    cols,
    rows,
    luma,
  };
}
