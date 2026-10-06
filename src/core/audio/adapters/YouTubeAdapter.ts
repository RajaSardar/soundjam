import { IAudioAdapter } from './IAudioAdapter';
import { AudioSourceType } from '../../../types';

export class YouTubeAdapter implements IAudioAdapter {
  public readonly sourceType: AudioSourceType = 'youtube';
  private player: any = null;
  private currentVideoId: string = '';
  private currentTimeSimulated: number = 0;
  private durationSimulated: number = 240;
  private isPlaying: boolean = false;
  private timer: any = null;

  constructor() {}

  public async load(sourceUrlOrId: string): Promise<void> {
    this.currentVideoId = this.extractVideoId(sourceUrlOrId);
    this.currentTimeSimulated = 0;
    this.isPlaying = false;
    if (this.timer) clearInterval(this.timer);
    return Promise.resolve();
  }

  public async play(): Promise<void> {
    this.isPlaying = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.isPlaying && this.currentTimeSimulated < this.durationSimulated) {
        this.currentTimeSimulated += 1;
      }
    }, 1000);
    return Promise.resolve();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timer) clearInterval(this.timer);
  }

  public seek(seconds: number): void {
    this.currentTimeSimulated = Math.max(0, Math.min(seconds, this.durationSimulated));
  }

  public setVolume(_volume: number): void {}

  public getCurrentTime(): number {
    return this.currentTimeSimulated;
  }

  public getDuration(): number {
    return this.durationSimulated;
  }

  public cleanup(): void {
    this.pause();
  }

  private extractVideoId(urlOrId: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  }
}
