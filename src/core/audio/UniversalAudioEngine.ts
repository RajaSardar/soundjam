import { IAudioAdapter } from './adapters/IAudioAdapter';
import { WebAudioAdapter } from './adapters/WebAudioAdapter';
import { YouTubeAdapter } from './adapters/YouTubeAdapter';
import { SoundCloudAdapter } from './adapters/SoundCloudAdapter';
import { SpotifyAdapter } from './adapters/SpotifyAdapter';
import { Track, AudioSourceType } from '../../types';

export class UniversalAudioEngine {
  private adapters: Map<AudioSourceType, IAudioAdapter> = new Map();
  private currentTrack: Track | null = null;
  private activeAdapter: IAudioAdapter | null = null;
  private volume: number = 0.85;
  private muted: boolean = false;
  private playingState: boolean = false;

  constructor() {
    this.adapters.set('local', new WebAudioAdapter('local'));
    this.adapters.set('stream', new WebAudioAdapter('stream'));
    this.adapters.set('youtube', new YouTubeAdapter());
    this.adapters.set('soundcloud', new SoundCloudAdapter());
    this.adapters.set('spotify', new SpotifyAdapter());
  }

  public async loadTrack(track: Track): Promise<void> {
    // If switching adapters, pause previous
    if (this.activeAdapter && this.activeAdapter.sourceType !== track.source) {
      this.activeAdapter.pause();
    }

    const adapter = this.adapters.get(track.source) || this.adapters.get('local')!;
    this.activeAdapter = adapter;
    this.currentTrack = track;
    this.activeAdapter.setVolume(this.muted ? 0 : this.volume);
    await this.activeAdapter.load(track.sourceUrlOrId);
  }

  public async play(): Promise<void> {
    if (this.activeAdapter) {
      await this.activeAdapter.play();
      this.playingState = true;
    }
  }

  public pause(): void {
    if (this.activeAdapter) {
      this.activeAdapter.pause();
      this.playingState = false;
    }
  }

  public seek(seconds: number): void {
    if (this.activeAdapter) {
      this.activeAdapter.seek(seconds);
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.activeAdapter && !this.muted) {
      this.activeAdapter.setVolume(this.volume);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.activeAdapter) {
      this.activeAdapter.setVolume(muted ? 0 : this.volume);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isPlaying(): boolean {
    return this.playingState;
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public getActiveSourceType(): AudioSourceType | null {
    return this.activeAdapter ? this.activeAdapter.sourceType : null;
  }

  public getCurrentTime(): number {
    return this.activeAdapter ? this.activeAdapter.getCurrentTime() : 0;
  }

  public getDuration(): number {
    if (this.currentTrack && this.currentTrack.duration) {
      return this.currentTrack.duration;
    }
    return this.activeAdapter ? this.activeAdapter.getDuration() : 0;
  }

  public getAnalyser(): AnalyserNode | null {
    if (this.activeAdapter instanceof WebAudioAdapter) {
      return this.activeAdapter.getAnalyser();
    }
    return null;
  }

  public cleanup(): void {
    this.adapters.forEach(adapter => adapter.cleanup());
    this.activeAdapter = null;
    this.currentTrack = null;
    this.playingState = false;
  }
}
