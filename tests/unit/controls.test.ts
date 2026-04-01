import { beforeEach, describe, expect, it } from 'vitest';

import { createAppShell, readSettings } from '../../src/ui/controls';
import type { Settings } from '../../src/types';

const baseSettings: Settings = {
  mode: 'mono',
  cols: 96,
  fontFamily: 'Georgia',
  fontSize: 16,
  lineHeight: 18,
  palette: ' .:-=+*#%@',
  invert: false,
  beamWidth: 6,
  candidatesPerCell: 4,
  densityCanvasSize: 64,
  displayScale: 0.5,
};

describe('controls', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('renders the display scale control from settings', () => {
    const root = document.querySelector<HTMLElement>('#root')!;
    createAppShell(root, baseSettings);

    const input = root.querySelector<HTMLInputElement>('[aria-label="Display scale"]');

    expect(input?.value).toBe('50');
  });

  it('reads the display scale percentage into a 0..1 value', () => {
    const root = document.querySelector<HTMLElement>('#root')!;
    const elements = createAppShell(root, baseSettings);
    const input = elements.form.elements.namedItem('displayScale') as HTMLInputElement;
    input.value = '75';

    const settings = readSettings(elements.form, baseSettings);

    expect(settings.displayScale).toBe(0.75);
  });
});
