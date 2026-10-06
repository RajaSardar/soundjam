import { AudioSourceType } from '../../../types';

export interface IAudioAdapter {
  readonly sourceType: AudioSourceType;
  load(sourceUrlOrId: string): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  cleanup(): void;
}
