export async function ensureFontLoaded(font: string, sampleText: string): Promise<void> {
  await document.fonts.load(font, sampleText);
}
