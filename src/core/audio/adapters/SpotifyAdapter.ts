import { IAudioAdapter } from './IAudioAdapter';
import { AudioSourceType } from '../../../types';

export class SpotifyAdapter implements IAudioAdapter {
  public readonly sourceType: AudioSourceType = 'spotify';
  private audioElement: HTMLAudioElement;
  private isPreview: boolean = true;
  private currentTimeSimulated: number = 0;
  private duration: number = 30; // 30 sec preview or full if SDK

  constructor() {
    this.audioElement = new Audio();
  }

  public async load(sourceUrlOrId: string): Promise<void> {
    if (sourceUrlOrId.startsWith('http')) {
      this.audioElement.src = sourceUrlOrId;
      this.isPreview = true;
    } else {
      this.currentTimeSimulated = 0;
    }
    return Promise.resolve();
  }

  public async play(): Promise<void> {
    if (this.audioElement.src) {
      return this.audioElement.play();
    }
    return Promise.resolve();
  }

  public pause(): void {
    if (this.audioElement.src) {
      this.audioElement.pause();
    }
  }

  public seek(seconds: number): void {
    if (this.audioElement.src) {
      this.audioElement.currentTime = seconds;
    } else {
      this.currentTimeSimulated = seconds;
    }
  }

  public setVolume(volume: number): void {
    this.audioElement.volume = Math.max(0, Math.min(1, volume));
  }

  public getCurrentTime(): number {
    return this.audioElement.src ? this.audioElement.currentTime : this.currentTimeSimulated;
  }

  public getDuration(): number {
    return this.audioElement.src ? this.audioElement.duration || this.duration : this.duration;
  }

  public cleanup(): void {
    this.pause();
    this.audioElement.src = '';
  }
}
