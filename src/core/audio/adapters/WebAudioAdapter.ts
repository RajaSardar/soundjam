import { IAudioAdapter } from './IAudioAdapter';
import { AudioSourceType } from '../../../types';

export class WebAudioAdapter implements IAudioAdapter {
  public readonly sourceType: AudioSourceType = 'local';
  private audioElement: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isLoaded: boolean = false;

  constructor(sourceType: AudioSourceType = 'local') {
    this.sourceType = sourceType;
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';
  }

  public initWebAudio(): void {
    if (!this.audioContext && typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      try {
        const source = this.audioContext.createMediaElementSource(this.audioElement);
        source.connect(this.gainNode);
        this.gainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
      } catch (e) {
        // Fallback for mock environments
      }
    }
  }

  public async load(sourceUrlOrId: string): Promise<void> {
    this.initWebAudio();
    this.audioElement.src = sourceUrlOrId;
    this.isLoaded = true;
    return new Promise((resolve) => {
      // In browser or mock, resolve when canplay or immediately
      this.audioElement.oncanplay = () => resolve();
      // Safety resolve for mock environments
      setTimeout(resolve, 50);
    });
  }

  public async play(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this.audioElement.play();
  }

  public pause(): void {
    this.audioElement.pause();
  }

  public seek(seconds: number): void {
    this.audioElement.currentTime = seconds;
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = clamped;
    if (this.gainNode) {
      this.gainNode.gain.value = clamped;
    }
  }

  public getCurrentTime(): number {
    return this.audioElement.currentTime || 0;
  }

  public getDuration(): number {
    return this.audioElement.duration || 0;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public cleanup(): void {
    this.audioElement.pause();
    this.audioElement.src = '';
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}
