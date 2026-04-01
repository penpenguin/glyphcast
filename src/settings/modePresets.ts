import type { RenderMode, Settings } from '../types';

export const MONO_PALETTE =
  " .'`^\",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

export const TYPOGRAPHIC_PALETTE = Array.from(
  { length: 95 },
  (_, index) => String.fromCharCode(32 + index),
).join('');

function createBaseSettings(): Settings {
  return {
    mode: 'mono',
    cols: 96,
    fontFamily: 'Courier New',
    fontSize: 16,
    lineHeight: 18,
    palette: MONO_PALETTE,
    invert: false,
    beamWidth: 6,
    candidatesPerCell: 4,
    densityCanvasSize: 64,
    displayScale: 0.5,
  };
}

export function applyModePreset(mode: RenderMode, settings: Settings): Settings {
  if (mode === 'typographic') {
    return {
      ...settings,
      mode,
      fontFamily: 'Georgia',
      palette: TYPOGRAPHIC_PALETTE,
      beamWidth: 10,
      candidatesPerCell: 10,
      densityCanvasSize: 64,
    };
  }

  return {
    ...settings,
    mode,
    fontFamily: 'Courier New',
    palette: MONO_PALETTE,
    beamWidth: 6,
    candidatesPerCell: 4,
    densityCanvasSize: 64,
  };
}

export function createDefaultSettings(): Settings {
  return applyModePreset('mono', createBaseSettings());
}
