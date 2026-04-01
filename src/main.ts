import { AsciiVideoController } from './controller/AsciiVideoController';
import type { Settings } from './types';
import { createAppShell, readSettings } from './ui/controls';
import './style.css';

const defaultSettings: Settings = {
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

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root.');
}

const elements = createAppShell(app, defaultSettings);
const controller = new AsciiVideoController(
  {
    outputCanvas: elements.outputCanvas,
    outputHost: elements.outputHost,
    samplerCanvas: elements.samplerCanvas,
    stagePanel: elements.stagePanel,
    status: elements.status,
    video: elements.video,
  },
  defaultSettings,
);

elements.form.addEventListener('input', () => {
  const nextSettings = readSettings(elements.form, defaultSettings);
  void controller.setSettings(nextSettings);
});

elements.fileInput.addEventListener('change', () => {
  const file = elements.fileInput.files?.[0];
  if (!file) {
    return;
  }

  void controller.loadFile(file);
});

window.addEventListener('beforeunload', () => {
  controller.dispose();
});
