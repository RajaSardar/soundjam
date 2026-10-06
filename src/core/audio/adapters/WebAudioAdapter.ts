import { IAudioAdapter } from './IAudioAdapter';
import { AudioSourceType } from '../../../types';

export class WebAudioAdapter implements IAudioAdapter {
  public readonly sourceType: AudioSourceType = 'stream';
  private audioElement: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isSourceConnected: boolean = false;
  private onEndedCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;

  constructor(sourceType: AudioSourceType = 'stream') {
    this.sourceType = sourceType;
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';

    // Hook events
    this.audioElement.addEventListener('ended', () => {
      if (this.onEndedCallback) this.onEndedCallback();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audioElement.currentTime);
      }
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('[SoundJam Audio] HTMLMediaElement error:', this.audioElement.error, e);
    });
  }

  public setOnEnded(cb: () => void): void {
    this.onEndedCallback = cb;
  }

  public setOnTimeUpdate(cb: (time: number) => void): void {
    this.onTimeUpdateCallback = cb;
  }

  public unlockAudio(): void {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && !this.audioContext) {
        try {
          this.audioContext = new AudioCtx();
        } catch (e) {
          // Ignore
        }
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
    }
  }

  public initWebAudio(): void {
    this.unlockAudio();
    if (this.audioContext && !this.isSourceConnected) {
      try {
        this.gainNode = this.audioContext.createGain();
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;

        // Note: createMediaElementSource can throw if CORS fails or already connected
        const source = this.audioContext.createMediaElementSource(this.audioElement);
        source.connect(this.gainNode);
        this.gainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
        this.isSourceConnected = true;
      } catch (e) {
        // Fallback: browser will still play audio directly via HTMLMediaElement to speakers!
        console.warn('[WebAudio] createMediaElementSource skipped or direct audio routed:', e);
      }
    }
  }

  public async load(sourceUrlOrId: string): Promise<void> {
    this.unlockAudio();
    return new Promise((resolve) => {
      this.audioElement.src = sourceUrlOrId;
      this.audioElement.load();

      const onCanPlay = () => {
        this.audioElement.removeEventListener('canplay', onCanPlay);
        resolve();
      };
      this.audioElement.addEventListener('canplay', onCanPlay);

      // Safety fallback resolve after 250ms so app never blocks
      setTimeout(resolve, 250);
    });
  }

  public async play(): Promise<void> {
    this.unlockAudio();
    try {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err: any) {
      console.warn('[SoundJam Audio] play() failed (likely autoplay restriction):', err);
      throw err;
    }
  }

  public pause(): void {
    this.audioElement.pause();
  }

  public seek(seconds: number): void {
    if (!isNaN(seconds) && isFinite(seconds)) {
      this.audioElement.currentTime = seconds;
    }
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = clamped;
    if (this.gainNode) {
      try {
        this.gainNode.gain.value = clamped;
      } catch (e) {}
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
    this.pause();
    this.audioElement.src = '';
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
      this.isSourceConnected = false;
    }
  }
}
