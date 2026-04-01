import { describe, expect, it } from 'vitest';

import {
  applyModePreset,
  createDefaultSettings,
  MONO_PALETTE,
  TYPOGRAPHIC_PALETTE,
} from '../../src/settings/modePresets';

describe('modePresets', () => {
  it('uses a monospaced font and a dense ASCII ramp for mono defaults', () => {
    const settings = createDefaultSettings();

    expect(settings.mode).toBe('mono');
    expect(settings.fontFamily).toBe('Courier New');
    expect(settings.palette).toBe(MONO_PALETTE);
    expect(settings.palette.length).toBeGreaterThan(40);
  });

  it('uses printable ASCII and wider search defaults for typographic mode', () => {
    const settings = applyModePreset('typographic', createDefaultSettings());

    expect(settings.fontFamily).toBe('Georgia');
    expect(settings.palette).toBe(TYPOGRAPHIC_PALETTE);
    expect(settings.palette.length).toBe(95);
    expect(settings.beamWidth).toBe(10);
    expect(settings.candidatesPerCell).toBe(10);
  });
});
