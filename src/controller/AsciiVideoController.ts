import { clearCache } from '@chenglou/pretext';

import { composeMono } from '../compose/MonoComposer';
import { composeTypographic } from '../compose/TypographicComposer';
import { buildGlyphCatalog } from '../glyph/GlyphCatalog';
import { CanvasRenderer } from '../render/CanvasRenderer';
import type { ComposedFrame, GlyphCatalog, Settings } from '../types';
import { getStageLayout } from '../ui/getStageLayout';
import { FrameSource } from '../video/FrameSource';
import { imageDataToLumaGrid } from '../video/Sampler';
import { computeRows } from '../video/computeRows';

export interface AsciiVideoControllerElements {
  outputCanvas: HTMLCanvasElement;
  outputHost: HTMLElement;
  samplerCanvas: HTMLCanvasElement;
  stagePanel: HTMLElement;
  status: HTMLElement;
  video: HTMLVideoElement;
}

const DEFAULT_OUTPUT_WIDTH = 960;

function needsCatalogRebuild(previous: Settings, next: Settings): boolean {
  return (
    previous.fontFamily !== next.fontFamily ||
    previous.fontSize !== next.fontSize ||
    previous.lineHeight !== next.lineHeight ||
    previous.palette !== next.palette ||
    previous.candidatesPerCell !== next.candidatesPerCell ||
    previous.densityCanvasSize !== next.densityCanvasSize
  );
}

function needsGridRebuild(previous: Settings, next: Settings): boolean {
  return (
    previous.cols !== next.cols ||
    previous.lineHeight !== next.lineHeight ||
    previous.displayScale !== next.displayScale
  );
}

export class AsciiVideoController {
  private settings: Settings;
  private catalog: GlyphCatalog | null = null;
  private readonly renderer: CanvasRenderer;
  private readonly frameSource: FrameSource;
  private readonly resizeObserver: ResizeObserver;
  private objectUrl: string | null = null;
  private rebuildToken = 0;
  private hasVideoMetadata = false;

  constructor(
    private readonly elements: AsciiVideoControllerElements,
    initialSettings: Settings,
  ) {
    this.settings = initialSettings;
    this.renderer = new CanvasRenderer(elements.outputCanvas);
    this.frameSource = new FrameSource(elements.video, elements.samplerCanvas);
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.hasVideoMetadata) {
        return;
      }

      void this.rebuildPipeline(false);
    });

    this.resizeObserver.observe(elements.outputHost);
    this.setStatus('動画を読み込んでください。');
  }

  async loadFile(file: File): Promise<void> {
    this.setStatus('動画メタデータを読み込んでいます...');
    this.frameSource.stop();
    this.hasVideoMetadata = false;

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }

    this.objectUrl = URL.createObjectURL(file);

    const metadataLoaded = new Promise<void>((resolve, reject) => {
      const handleLoaded = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error('動画の読み込みに失敗しました。'));
      };
      const cleanup = () => {
        this.elements.video.removeEventListener('loadedmetadata', handleLoaded);
        this.elements.video.removeEventListener('error', handleError);
      };

      this.elements.video.addEventListener('loadedmetadata', handleLoaded, { once: true });
      this.elements.video.addEventListener('error', handleError, { once: true });
    });

    this.elements.video.src = this.objectUrl;
    this.elements.video.load();

    await metadataLoaded;
    this.hasVideoMetadata = true;
    this.syncStageLayout();
    await this.rebuildPipeline(true);
    await this.elements.video.play().catch(() => undefined);
  }

  async setSettings(nextSettings: Settings): Promise<void> {
    const previous = this.settings;
    this.settings = nextSettings;

    if (!this.hasVideoMetadata) {
      return;
    }

    if (needsCatalogRebuild(previous, nextSettings)) {
      await this.rebuildPipeline(true);
      return;
    }

    if (needsGridRebuild(previous, nextSettings)) {
      await this.rebuildPipeline(false);
    }
  }

  dispose(): void {
    this.resizeObserver.disconnect();
    this.frameSource.stop();

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }

    clearCache();
  }

  private async rebuildPipeline(rebuildCatalog: boolean): Promise<void> {
    if (!this.hasVideoMetadata) {
      return;
    }

    const token = ++this.rebuildToken;
    this.frameSource.stop();

    if (rebuildCatalog || !this.catalog) {
      this.setStatus('グリフ計測を更新しています...');
      this.catalog = await buildGlyphCatalog(this.settings);

      if (token !== this.rebuildToken) {
        return;
      }
    }

    const catalog = this.catalog;
    if (!catalog) {
      return;
    }

    const outputWidth = this.getOutputWidth();
    const rows = computeRows(
      this.elements.video.videoWidth,
      this.elements.video.videoHeight,
      this.settings.cols,
      Math.max(catalog.averageWidth, 1),
      this.settings.lineHeight,
    );

    this.renderer.resize(
      outputWidth,
      rows,
      this.settings.lineHeight,
      this.settings.displayScale,
    );
    this.frameSource.start(this.settings.cols, rows, (image, mediaTime) => {
      this.renderFrame(image, mediaTime);
    });
    this.setStatus('再生中');
  }

  private renderFrame(image: ImageData, mediaTime: number): void {
    if (!this.catalog) {
      return;
    }

    const grid = imageDataToLumaGrid(image, this.settings.invert);
    let frame: ComposedFrame;

    if (this.settings.mode === 'mono') {
      const rows = composeMono(grid, this.catalog).map((text) => [
        {
          text,
          x: 0,
          font: this.catalog?.monoFont ?? `${this.settings.fontSize}px "${this.settings.fontFamily}"`,
        },
      ]);
      frame = { rows };
    } else {
      frame = {
        rows: composeTypographic(
          grid,
          this.catalog,
          this.getOutputWidth(),
          this.settings.beamWidth,
        ),
      };
    }

    this.renderer.render(frame, this.settings);
    this.setStatus(
      `${this.settings.mode} ${mediaTime.toFixed(2)}s cols:${this.settings.cols}`,
    );
  }

  private getOutputWidth(): number {
    return this.elements.outputHost.clientWidth || DEFAULT_OUTPUT_WIDTH;
  }

  private syncStageLayout(): void {
    this.elements.stagePanel.dataset.layout = getStageLayout(
      this.elements.video.videoWidth,
      this.elements.video.videoHeight,
    );
  }

  private setStatus(message: string): void {
    this.elements.status.textContent = message;
  }
}
