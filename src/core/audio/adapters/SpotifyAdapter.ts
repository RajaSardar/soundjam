import { IAudioAdapter } from './IAudioAdapter';
import { AudioSourceType } from '../../../types';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

export class SpotifyAdapter implements IAudioAdapter {
  public readonly sourceType: AudioSourceType = 'spotify';
  private audioElement: HTMLAudioElement;
  private spotifySdkPlayer: any = null;
  private accessToken: string | null = null;
  private deviceId: string | null = null;
  private currentTrackUri: string = '';
  private isSdkReady: boolean = false;
  private isUsingSdk: boolean = false;
  private isPlayingState: boolean = false;
  private currentTimeSimulated: number = 0;
  private duration: number = 30;
  private onEndedCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private timer: any = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';

    this.audioElement.addEventListener('ended', () => {
      this.isPlayingState = false;
      if (this.onEndedCallback) this.onEndedCallback();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audioElement.currentTime);
      }
    });

    // Check if token exists in localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('soundjam_spotify_token');
      if (stored) {
        this.setAccessToken(stored);
      }
    }
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
    this.initSpotifySdk();
  }

  public setOnEnded(cb: () => void): void {
    this.onEndedCallback = cb;
  }

  public setOnTimeUpdate(cb: (time: number) => void): void {
    this.onTimeUpdateCallback = cb;
  }

  public async load(sourceUrlOrId: string): Promise<void> {
    this.pause();
    this.currentTimeSimulated = 0;

    // Check if it's a direct preview audio URL (e.g. p.scdn.co or https://...)
    if (sourceUrlOrId.startsWith('http')) {
      this.isUsingSdk = false;
      this.audioElement.src = sourceUrlOrId;
      this.duration = 30;
      return Promise.resolve();
    }

    // Spotify URI or track ID (e.g. spotify:track:..., or raw ID)
    const trackId = sourceUrlOrId.replace('spotify:track:', '');
    this.currentTrackUri = `spotify:track:${trackId}`;

    // If we have an active SDK connection and access token, use Web Playback SDK
    if (this.accessToken && this.isSdkReady && this.deviceId) {
      this.isUsingSdk = true;
      try {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [this.currentTrackUri] }),
        });
      } catch (e) {
        console.warn('Spotify play via SDK error:', e);
      }
    } else {
      // Fallback: try fetching preview_url from Spotify API or Apple cross-reference
      this.isUsingSdk = false;
      this.duration = 30;
    }

    return Promise.resolve();
  }

  public async play(): Promise<void> {
    this.isPlayingState = true;

    if (this.isUsingSdk && this.spotifySdkPlayer) {
      try {
        await this.spotifySdkPlayer.resume();
      } catch (e) {
        console.warn('Spotify SDK resume failed:', e);
      }
      return Promise.resolve();
    }

    if (this.audioElement.src) {
      return this.audioElement.play().catch(e => {
        console.warn('Spotify preview audio play error:', e);
      });
    }

    // Simulated progress timer for Spotify tracks without direct preview audio
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.isPlayingState && this.currentTimeSimulated < this.duration) {
        this.currentTimeSimulated += 1;
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.currentTimeSimulated);
        }
      } else if (this.currentTimeSimulated >= this.duration) {
        this.pause();
        if (this.onEndedCallback) this.onEndedCallback();
      }
    }, 1000);

    return Promise.resolve();
  }

  public pause(): void {
    this.isPlayingState = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.isUsingSdk && this.spotifySdkPlayer) {
      try {
        this.spotifySdkPlayer.pause();
      } catch (e) {}
    }
    if (this.audioElement.src) {
      this.audioElement.pause();
    }
  }

  public seek(seconds: number): void {
    this.currentTimeSimulated = seconds;
    if (this.isUsingSdk && this.spotifySdkPlayer) {
      try {
        this.spotifySdkPlayer.seek(seconds * 1000);
      } catch (e) {}
    }
    if (this.audioElement.src) {
      this.audioElement.currentTime = seconds;
    }
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audioElement.volume = clamped;
    if (this.isUsingSdk && this.spotifySdkPlayer) {
      try {
        this.spotifySdkPlayer.setVolume(clamped);
      } catch (e) {}
    }
  }

  public getCurrentTime(): number {
    if (this.audioElement.src) {
      return this.audioElement.currentTime;
    }
    return this.currentTimeSimulated;
  }

  public getDuration(): number {
    if (this.audioElement.src && this.audioElement.duration) {
      return this.audioElement.duration;
    }
    return this.duration;
  }

  public cleanup(): void {
    this.pause();
    this.audioElement.src = '';
    if (this.spotifySdkPlayer) {
      try {
        this.spotifySdkPlayer.disconnect();
      } catch (e) {}
      this.spotifySdkPlayer = null;
    }
  }

  private initSpotifySdk(): void {
    if (typeof window === 'undefined') return;

    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      document.body.appendChild(script);
    }

    const setupPlayer = () => {
      if (!window.Spotify || !this.accessToken) return;

      try {
        this.spotifySdkPlayer = new window.Spotify.Player({
          name: 'SoundJam Web Player',
          getOAuthToken: (cb: any) => cb(this.accessToken),
          volume: 0.85,
        });

        this.spotifySdkPlayer.addListener('ready', ({ device_id }: any) => {
          this.deviceId = device_id;
          this.isSdkReady = true;
        });

        this.spotifySdkPlayer.addListener('not_ready', () => {
          this.isSdkReady = false;
        });

        this.spotifySdkPlayer.addListener('player_state_changed', (state: any) => {
          if (!state) return;
          this.currentTimeSimulated = Math.floor(state.position / 1000);
          this.duration = Math.floor(state.duration / 1000);
          this.isPlayingState = !state.paused;
          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(this.currentTimeSimulated);
          }
          if (state.position === 0 && state.paused && this.currentTimeSimulated > 0) {
            if (this.onEndedCallback) this.onEndedCallback();
          }
        });

        this.spotifySdkPlayer.connect();
      } catch (e) {
        console.warn('Error setting up Spotify Player:', e);
      }
    };

    if (window.Spotify) {
      setupPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        setupPlayer();
      };
    }
  }
}
