import type { ComposedFrame, Settings } from '../types';

export class CanvasRenderer {
  private logicalWidth = 0;
  private logicalHeight = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly devicePixelRatio = window.devicePixelRatio || 1,
  ) {}

  resize(cssWidth: number, rows: number, lineHeight: number, displayScale = 1): void {
    const cssHeight = rows * lineHeight;
    const clampedScale = Math.max(0.1, displayScale);

    this.logicalWidth = cssWidth;
    this.logicalHeight = cssHeight;
    this.canvas.width = Math.round(cssWidth * this.devicePixelRatio);
    this.canvas.height = Math.round(cssHeight * this.devicePixelRatio);
    this.canvas.style.width = `${cssWidth * clampedScale}px`;
    this.canvas.style.height = `${cssHeight * clampedScale}px`;

    const context = this.canvas.getContext('2d');
    context?.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
  }

  render(frame: ComposedFrame, settings: Settings): void {
    const context = this.canvas.getContext('2d');
    if (!context) {
      return;
    }

    const width = this.logicalWidth || Number.parseFloat(this.canvas.style.width || '0');
    const height = this.logicalHeight || Number.parseFloat(this.canvas.style.height || '0');

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#fff';
    context.textBaseline = 'top';

    for (let y = 0; y < frame.rows.length; y += 1) {
      const yPx = y * settings.lineHeight;

      for (const run of frame.rows[y] ?? []) {
        context.font = run.font;
        context.fillText(run.text, run.x, yPx);
      }
    }
  }
}
