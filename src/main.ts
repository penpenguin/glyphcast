import { AsciiVideoController } from './controller/AsciiVideoController';
import { applyModePreset, createDefaultSettings } from './settings/modePresets';
import { createAppShell, readSettings, writeSettings } from './ui/controls';
import './style.css';

let currentSettings = createDefaultSettings();

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app root.');
}

const elements = createAppShell(app, currentSettings);
const controller = new AsciiVideoController(
  {
    outputCanvas: elements.outputCanvas,
    outputHost: elements.outputHost,
    samplerCanvas: elements.samplerCanvas,
    stagePanel: elements.stagePanel,
    status: elements.status,
    video: elements.video,
  },
  currentSettings,
);

elements.form.addEventListener('input', () => {
  const draftSettings = readSettings(elements.form, currentSettings);
  const nextSettings =
    draftSettings.mode !== currentSettings.mode
      ? applyModePreset(draftSettings.mode, draftSettings)
      : draftSettings;

  if (nextSettings !== draftSettings) {
    writeSettings(elements.form, nextSettings);
  }

  currentSettings = nextSettings;
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
