type OnFrame = (image: ImageData, mediaTime: number) => void;

export class FrameSource {
  private rafId: number | null = null;
  private rvfcId: number | null = null;
  private onFrame: OnFrame | null = null;
  private width = 0;
  private height = 0;

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly canvas: HTMLCanvasElement,
  ) {}

  start(width: number, height: number, onFrame: OnFrame): void {
    this.stop();

    this.width = width;
    this.height = height;
    this.onFrame = onFrame;
    this.canvas.width = width;
    this.canvas.height = height;

    this.scheduleNext();
  }

  stop(): void {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const maybeVideo = this.video as HTMLVideoElement & {
      cancelVideoFrameCallback?: (id: number) => void;
    };
    if (this.rvfcId != null && typeof maybeVideo.cancelVideoFrameCallback === 'function') {
      maybeVideo.cancelVideoFrameCallback(this.rvfcId);
      this.rvfcId = null;
    }
  }

  private scheduleNext(): void {
    const maybeVideo = this.video as HTMLVideoElement & {
      requestVideoFrameCallback?: (
        callback: (now: number, metadata: { mediaTime: number }) => void,
      ) => number;
    };

    if (typeof maybeVideo.requestVideoFrameCallback === 'function') {
      this.rvfcId = maybeVideo.requestVideoFrameCallback((_now, metadata) => {
        this.processFrame(metadata.mediaTime);
      });
      return;
    }

    this.rafId = requestAnimationFrame(() => {
      this.processFrame(this.video.currentTime);
    });
  }

  private processFrame(mediaTime: number): void {
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context || !this.onFrame) {
      return;
    }

    context.drawImage(this.video, 0, 0, this.width, this.height);
    const image = context.getImageData(0, 0, this.width, this.height);
    this.onFrame(image, mediaTime);
    this.scheduleNext();
  }
}
