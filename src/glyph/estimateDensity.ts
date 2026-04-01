export function estimateDensity(
  char: string,
  font: string,
  size = 64,
): number {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    return 0;
  }

  context.clearRect(0, 0, size, size);
  context.fillStyle = '#fff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = font;
  context.fillText(char, size / 2, size / 2);

  const image = context.getImageData(0, 0, size, size);
  let alphaSum = 0;

  for (let index = 3; index < image.data.length; index += 4) {
    alphaSum += image.data[index] ?? 0;
  }

  return alphaSum / (255 * size * size);
}
