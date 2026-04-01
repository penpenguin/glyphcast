import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FrameSource } from '../../src/video/FrameSource';

function createCanvasContext() {
  return {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1)),
  };
}

describe('FrameSource', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses requestVideoFrameCallback when available', () => {
    const context = createCanvasContext();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
    } as unknown as HTMLCanvasElement;
    let scheduled: ((now: number, meta: { mediaTime: number }) => void) | null = null;
    const video = {
      currentTime: 1.25,
      requestVideoFrameCallback: vi.fn((callback) => {
        scheduled = callback;
        return 9;
      }),
      cancelVideoFrameCallback: vi.fn(),
    } as unknown as HTMLVideoElement;
    const onFrame = vi.fn();

    const source = new FrameSource(video, canvas);
    source.start(4, 3, onFrame);

    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(3);
    expect(video.requestVideoFrameCallback).toHaveBeenCalledTimes(1);

    const scheduledCallback = scheduled as ((now: number, meta: { mediaTime: number }) => void) | null;
    scheduledCallback?.(0, { mediaTime: 2.5 });

    expect(context.drawImage).toHaveBeenCalledWith(video, 0, 0, 4, 3);
    expect(onFrame).toHaveBeenCalledWith(expect.any(ImageData), 2.5);
    expect(video.requestVideoFrameCallback).toHaveBeenCalledTimes(2);

    source.stop();
    expect(video.cancelVideoFrameCallback).toHaveBeenCalledWith(9);
  });

  it('falls back to requestAnimationFrame when video frame callbacks are unavailable', () => {
    const context = createCanvasContext();
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => context),
    } as unknown as HTMLCanvasElement;
    let scheduled: FrameRequestCallback | null = null;
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        scheduled = callback;
        return 11;
      });
    const cancelAnimationFrameSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => undefined);
    const video = {
      currentTime: 3.75,
    } as HTMLVideoElement;
    const onFrame = vi.fn();

    const source = new FrameSource(video, canvas);
    source.start(2, 2, onFrame);

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

    const scheduledCallback = scheduled as FrameRequestCallback | null;
    scheduledCallback?.(0);

    expect(context.drawImage).toHaveBeenCalledWith(video, 0, 0, 2, 2);
    expect(onFrame).toHaveBeenCalledWith(expect.any(ImageData), 3.75);

    source.stop();
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(11);
  });
});
