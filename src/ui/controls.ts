import type { RenderMode, Settings } from '../types';
import type { StageLayout } from './getStageLayout';

export interface AppElements {
  fileInput: HTMLInputElement;
  form: HTMLFormElement;
  outputCanvas: HTMLCanvasElement;
  outputHost: HTMLDivElement;
  samplerCanvas: HTMLCanvasElement;
  status: HTMLParagraphElement;
  stagePanel: HTMLElement;
  video: HTMLVideoElement;
}

const FONT_CHOICES = ['Georgia', 'Times New Roman', 'Courier New'];

function optionMarkup(value: string, selectedValue: string): string {
  return `<option value="${value}"${value === selectedValue ? ' selected' : ''}>${value}</option>`;
}

export function createAppShell(root: HTMLElement, settings: Settings): AppElements {
  root.innerHTML = `
    <div class="app-shell">
      <aside class="controls-panel">
        <h1>Glyphcast</h1>
        <p class="subtitle">Canvas 2D ASCII video playground</p>
        <form data-testid="settings-form" class="controls-grid">
          <label>
            <span>Video file</span>
            <input data-testid="file-input" name="video" type="file" accept="video/mp4,video/webm" />
          </label>
          <label>
            <span>Mode</span>
            <select name="mode" aria-label="Mode">
              <option value="mono"${settings.mode === 'mono' ? ' selected' : ''}>mono</option>
              <option value="typographic"${settings.mode === 'typographic' ? ' selected' : ''}>typographic</option>
            </select>
          </label>
          <label>
            <span>Font family</span>
            <input name="fontFamily" aria-label="Font family" list="font-options" value="${settings.fontFamily}" />
          </label>
          <label>
            <span>Font size</span>
            <input name="fontSize" aria-label="Font size" type="number" min="8" max="72" step="1" value="${settings.fontSize}" />
          </label>
          <label>
            <span>Line height</span>
            <input name="lineHeight" aria-label="Line height" type="number" min="8" max="96" step="1" value="${settings.lineHeight}" />
          </label>
          <label>
            <span>Palette</span>
            <input name="palette" aria-label="Palette" type="text" value="${settings.palette}" />
          </label>
          <label>
            <span>Cols</span>
            <input name="cols" aria-label="Cols" type="number" min="8" max="240" step="1" value="${settings.cols}" />
          </label>
          <label class="checkbox-row">
            <input name="invert" aria-label="Invert" type="checkbox"${settings.invert ? ' checked' : ''} />
            <span>Invert</span>
          </label>
          <label>
            <span>Beam width</span>
            <input name="beamWidth" aria-label="Beam width" type="number" min="1" max="32" step="1" value="${settings.beamWidth}" />
          </label>
          <label>
            <span>Candidates per cell</span>
            <input name="candidatesPerCell" aria-label="Candidates per cell" type="number" min="1" max="16" step="1" value="${settings.candidatesPerCell}" />
          </label>
          <label>
            <span>Density canvas size</span>
            <input name="densityCanvasSize" aria-label="Density canvas size" type="number" min="16" max="256" step="1" value="${settings.densityCanvasSize}" />
          </label>
          <label>
            <span>Display scale (%)</span>
            <input name="displayScale" aria-label="Display scale" type="number" min="10" max="100" step="5" value="${Math.round(settings.displayScale * 100)}" />
          </label>
        </form>
        <datalist id="font-options">
          ${FONT_CHOICES.map((font) => optionMarkup(font, settings.fontFamily)).join('')}
        </datalist>
        <p data-testid="status" class="status">Ready</p>
      </aside>

      <main class="stage-panel" data-layout="stacked">
        <section class="video-panel">
          <h2>Source</h2>
          <video data-testid="source-video" controls muted playsinline preload="metadata"></video>
        </section>
        <section class="output-panel">
          <h2>Output</h2>
          <div class="canvas-host" data-testid="output-host">
            <canvas data-testid="output-canvas"></canvas>
          </div>
        </section>
      </main>
      <canvas data-role="sampler" hidden></canvas>
    </div>
  `;

  return {
    fileInput: root.querySelector('[data-testid="file-input"]') as HTMLInputElement,
    form: root.querySelector('[data-testid="settings-form"]') as HTMLFormElement,
    outputCanvas: root.querySelector('[data-testid="output-canvas"]') as HTMLCanvasElement,
    outputHost: root.querySelector('[data-testid="output-host"]') as HTMLDivElement,
    samplerCanvas: root.querySelector('[data-role="sampler"]') as HTMLCanvasElement,
    status: root.querySelector('[data-testid="status"]') as HTMLParagraphElement,
    stagePanel: root.querySelector('.stage-panel') as HTMLElement,
    video: root.querySelector('[data-testid="source-video"]') as HTMLVideoElement,
  };
}

export function applyStageLayout(stagePanel: HTMLElement, layout: StageLayout): void {
  stagePanel.dataset.layout = layout;
}

function readInteger(input: HTMLInputElement, fallback: number, minimum = 1): number {
  const parsed = Number.parseInt(input.value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(minimum, parsed);
}

export function readSettings(form: HTMLFormElement, fallback: Settings): Settings {
  const modeInput = form.elements.namedItem('mode') as HTMLSelectElement;
  const fontFamilyInput = form.elements.namedItem('fontFamily') as HTMLInputElement;
  const fontSizeInput = form.elements.namedItem('fontSize') as HTMLInputElement;
  const lineHeightInput = form.elements.namedItem('lineHeight') as HTMLInputElement;
  const paletteInput = form.elements.namedItem('palette') as HTMLInputElement;
  const colsInput = form.elements.namedItem('cols') as HTMLInputElement;
  const invertInput = form.elements.namedItem('invert') as HTMLInputElement;
  const beamWidthInput = form.elements.namedItem('beamWidth') as HTMLInputElement;
  const candidatesInput = form.elements.namedItem('candidatesPerCell') as HTMLInputElement;
  const densityCanvasInput = form.elements.namedItem('densityCanvasSize') as HTMLInputElement;
  const displayScaleInput = form.elements.namedItem('displayScale') as HTMLInputElement;

  const mode = (modeInput.value === 'typographic' ? 'typographic' : 'mono') as RenderMode;
  const fontFamily = fontFamilyInput.value.trim() || fallback.fontFamily;
  const palette = paletteInput.value.length > 0 ? paletteInput.value : fallback.palette;

  return {
    mode,
    cols: readInteger(colsInput, fallback.cols, 1),
    fontFamily,
    fontSize: readInteger(fontSizeInput, fallback.fontSize, 1),
    lineHeight: readInteger(lineHeightInput, fallback.lineHeight, 1),
    palette,
    invert: invertInput.checked,
    beamWidth: readInteger(beamWidthInput, fallback.beamWidth, 1),
    candidatesPerCell: readInteger(candidatesInput, fallback.candidatesPerCell, 1),
    densityCanvasSize: readInteger(densityCanvasInput, fallback.densityCanvasSize, 1),
    displayScale: Math.max(
      0.1,
      Math.min(1, readInteger(displayScaleInput, fallback.displayScale * 100, 10) / 100),
    ),
  };
}
