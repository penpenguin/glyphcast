import { Buffer } from 'node:buffer';

import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const timers = new Map<number, number>();
    let nextFrameId = 0;

    Object.defineProperty(window.HTMLVideoElement.prototype, 'videoWidth', {
      configurable: true,
      get() {
        return 160;
      },
    });

    Object.defineProperty(window.HTMLVideoElement.prototype, 'videoHeight', {
      configurable: true,
      get() {
        return 90;
      },
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, 'currentTime', {
      configurable: true,
      get() {
        return 1.5;
      },
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
      configurable: true,
      value() {
        queueMicrotask(() => {
          this.dispatchEvent(new Event('loadedmetadata'));
        });
      },
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value() {
        return Promise.resolve();
      },
    });

    Object.defineProperty(window.HTMLVideoElement.prototype, 'requestVideoFrameCallback', {
      configurable: true,
      value(callback: (now: number, metadata: { mediaTime: number }) => void) {
        const id = ++nextFrameId;
        const timer = window.setTimeout(() => {
          callback(performance.now(), { mediaTime: 1.5 });
        }, 16);

        timers.set(id, timer);
        return id;
      },
    });

    Object.defineProperty(window.HTMLVideoElement.prototype, 'cancelVideoFrameCallback', {
      configurable: true,
      value(id: number) {
        const timer = timers.get(id);
        if (timer != null) {
          window.clearTimeout(timer);
          timers.delete(id);
        }
      },
    });

    const originalCreateObjectURL = URL.createObjectURL.bind(URL);
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value(blob: Blob) {
        return originalCreateObjectURL(blob);
      },
    });

    const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    const patchedDrawImage = function (this: CanvasRenderingContext2D, ...args: unknown[]) {
      if (args[0] instanceof HTMLVideoElement) {
        return;
      }

      return (originalDrawImage as unknown as (...input: unknown[]) => void).apply(this, args);
    };
    CanvasRenderingContext2D.prototype.drawImage =
      patchedDrawImage as CanvasRenderingContext2D['drawImage'];

    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (sx, sy, sw, sh) {
      if (this.canvas.dataset.role === 'sampler') {
        const data = new Uint8ClampedArray(sw * sh * 4);

        for (let y = 0; y < sh; y += 1) {
          for (let x = 0; x < sw; x += 1) {
            const offset = (y * sw + x) * 4;
            const shade = Math.round((255 * (x + y)) / Math.max(sw + sh - 2, 1));
            data[offset] = shade;
            data[offset + 1] = shade;
            data[offset + 2] = shade;
            data[offset + 3] = 255;
          }
        }

        return new ImageData(data, sw, sh);
      }

      return originalGetImageData.call(this, sx, sy, sw, sh);
    };
  });
});

test('loads a local file and renders mono / typographic frames', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  await page.getByTestId('file-input').setInputFiles({
    name: 'sample.webm',
    mimeType: 'video/webm',
    buffer: Buffer.from('glyphcast-smoke'),
  });

  await expect.poll(async () => page.getByTestId('status').textContent()).toContain('mono');
  await expect
    .poll(async () => {
      return page.getByTestId('output-canvas').evaluate((canvas) => {
        const element = canvas as HTMLCanvasElement;
        const context = element.getContext('2d');
        if (!context || element.width === 0 || element.height === 0) {
          return false;
        }

        const image = context.getImageData(
          0,
          0,
          Math.min(element.width, 4),
          Math.min(element.height, 4),
        );

        return image.data.some((value: number) => value !== 0);
      });
    })
    .toBe(true);

  const initialHeight = await page
    .getByTestId('output-canvas')
    .evaluate((canvas) => getComputedStyle(canvas).height);

  await page.getByLabel('Mode').selectOption('typographic');
  await expect.poll(async () => page.getByTestId('status').textContent()).toContain('typographic');

  await page.getByLabel('Cols').fill('120');
  await expect
    .poll(async () => {
      return page
        .getByTestId('output-canvas')
        .evaluate((canvas) => getComputedStyle(canvas as HTMLCanvasElement).height);
    })
    .not.toBe(initialHeight);
});
