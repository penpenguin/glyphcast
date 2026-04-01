import { vi } from 'vitest';

class ResizeObserverMock {
  observe() {}
  disconnect() {}
  unobserve() {}
}

class ImageDataMock {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
vi.stubGlobal('ImageData', ImageDataMock);
