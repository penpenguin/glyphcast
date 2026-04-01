export type StageLayout = 'side-by-side' | 'stacked';

export function getStageLayout(videoWidth: number, videoHeight: number): StageLayout {
  if (videoWidth <= 0 || videoHeight <= 0) {
    return 'stacked';
  }

  return videoWidth >= videoHeight ? 'side-by-side' : 'stacked';
}
