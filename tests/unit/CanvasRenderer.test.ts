import { describe, expect, it, vi } from 'vitest';

import { CanvasRenderer } from '../../src/render/CanvasRenderer';

function createContext() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: '',
    font: '',
    textBaseline: '',
  };
}

describe('CanvasRenderer', () => {
  it('resizes the canvas using the device pixel ratio', () => {
    const context = createContext();
    const canvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
      getContext: vi.fn(() => context),
    } as unknown as HTMLCanvasElement;

    const renderer = new CanvasRenderer(canvas, 2);
    renderer.resize(120, 3, 18);

    expect(canvas.width).toBe(240);
    expect(canvas.height).toBe(108);
    expect(canvas.style.width).toBe('120px');
    expect(canvas.style.height).toBe('54px');
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it('can present the output at a smaller display scale without changing render resolution', () => {
    const context = createContext();
    const canvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
      getContext: vi.fn(() => context),
    } as unknown as HTMLCanvasElement;

    const renderer = new CanvasRenderer(canvas, 2);
    renderer.resize(120, 3, 18, 0.5);

    expect(canvas.width).toBe(240);
    expect(canvas.height).toBe(108);
    expect(canvas.style.width).toBe('60px');
    expect(canvas.style.height).toBe('27px');
  });

  it('draws a black background and then row runs from top to bottom', () => {
    const context = createContext();
    const canvas = {
      width: 120,
      height: 54,
      style: { width: '120px', height: '54px' },
      getContext: vi.fn(() => context),
    } as unknown as HTMLCanvasElement;

    const renderer = new CanvasRenderer(canvas, 1);
    renderer.render(
      {
        rows: [
          [{ text: 'abc', x: 0, font: '16px Georgia' }],
          [{ text: 'def', x: 10, font: '16px Georgia' }],
        ],
      },
      {
        mode: 'mono',
        cols: 3,
        fontFamily: 'Georgia',
        fontSize: 16,
        lineHeight: 18,
        palette: ' .#',
        invert: false,
        beamWidth: 6,
        candidatesPerCell: 4,
        densityCanvasSize: 64,
        displayScale: 0.5,
      },
    );

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 120, 54);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 120, 54);
    expect(context.textBaseline).toBe('top');
    expect(context.fillText).toHaveBeenNthCalledWith(1, 'abc', 0, 0);
    expect(context.fillText).toHaveBeenNthCalledWith(2, 'def', 10, 18);
  });

  it('clears and fills using the logical render size even when CSS display size is scaled down', () => {
    const context = createContext();
    const canvas = {
      width: 240,
      height: 108,
      style: { width: '60px', height: '27px' },
      getContext: vi.fn(() => context),
    } as unknown as HTMLCanvasElement;

    const renderer = new CanvasRenderer(canvas, 2);
    renderer.resize(120, 3, 18, 0.5);
    renderer.render(
      {
        rows: [[{ text: 'abc', x: 0, font: '16px Georgia' }]],
      },
      {
        mode: 'mono',
        cols: 3,
        fontFamily: 'Georgia',
        fontSize: 16,
        lineHeight: 18,
        palette: ' .#',
        invert: false,
        beamWidth: 6,
        candidatesPerCell: 4,
        densityCanvasSize: 64,
        displayScale: 0.5,
      },
    );

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 120, 54);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 120, 54);
  });
});
