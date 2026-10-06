import { IAudioAdapter } from './IAudioAdapter';
import { AudioSourceType } from '../../../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export class YouTubeAdapter implements IAudioAdapter {
  public readonly sourceType: AudioSourceType = 'youtube';
  private player: any = null;
  private currentVideoId: string = '';
  private isPlayerReady: boolean = false;
  private isPlayingState: boolean = false;
  private volumeLevel: number = 85;
  private duration: number = 0;
  private currentTimeSimulated: number = 0;
  private timeUpdateInterval: any = null;
  private onEndedCallback: (() => void) | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private containerId = 'soundjam-yt-iframe-player';

  constructor() {
    this.ensureYouTubeApiLoaded();
  }

  public setOnEnded(cb: () => void): void {
    this.onEndedCallback = cb;
  }

  public setOnTimeUpdate(cb: (time: number) => void): void {
    this.onTimeUpdateCallback = cb;
  }

  public async load(sourceUrlOrId: string): Promise<void> {
    const videoId = this.extractVideoId(sourceUrlOrId);
    this.currentVideoId = videoId;
    this.currentTimeSimulated = 0;
    this.isPlayingState = false;

    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }

    await this.ensurePlayerInitialized();

    if (this.player && this.isPlayerReady && typeof this.player.cueVideoById === 'function') {
      try {
        this.player.cueVideoById({
          videoId: this.currentVideoId,
          startSeconds: 0,
        });
      } catch (e) {
        console.warn('YouTube cueVideoById error:', e);
      }
    }
  }

  public async play(): Promise<void> {
    this.isPlayingState = true;
    await this.ensurePlayerInitialized();

    if (this.player && this.isPlayerReady && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo();
      } catch (e) {
        console.warn('YouTube playVideo error:', e);
      }
    }

    this.startTimeTracker();
  }

  public pause(): void {
    this.isPlayingState = false;
    if (this.player && this.isPlayerReady && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.warn('YouTube pauseVideo error:', e);
      }
    }
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  public seek(seconds: number): void {
    this.currentTimeSimulated = seconds;
    if (this.player && this.isPlayerReady && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true);
      } catch (e) {
        console.warn('YouTube seekTo error:', e);
      }
    }
  }

  public setVolume(volume: number): void {
    this.volumeLevel = Math.max(0, Math.min(100, Math.round(volume * 100)));
    if (this.player && this.isPlayerReady && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(this.volumeLevel);
      } catch (e) {
        console.warn('YouTube setVolume error:', e);
      }
    }
  }

  public getCurrentTime(): number {
    if (this.player && this.isPlayerReady && typeof this.player.getCurrentTime === 'function') {
      try {
        return this.player.getCurrentTime() || this.currentTimeSimulated;
      } catch (e) {
        return this.currentTimeSimulated;
      }
    }
    return this.currentTimeSimulated;
  }

  public getDuration(): number {
    if (this.player && this.isPlayerReady && typeof this.player.getDuration === 'function') {
      try {
        const dur = this.player.getDuration();
        if (dur && dur > 0) return dur;
      } catch (e) {}
    }
    return this.duration || 240;
  }

  public cleanup(): void {
    this.pause();
    if (this.player && typeof this.player.destroy === 'function') {
      try {
        this.player.destroy();
      } catch (e) {}
    }
    this.player = null;
    this.isPlayerReady = false;
  }

  private ensureYouTubeApiLoaded(): void {
    if (typeof window === 'undefined') return;

    if (!window.YT) {
      const existingScript = document.getElementById('youtube-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(tag, firstScript);
      }
    }
  }

  private async ensurePlayerInitialized(): Promise<void> {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (this.player) return;

    // Create container if not exists
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      // Style to allow background audio streaming while visually unobtrusive
      container.style.position = 'fixed';
      container.style.bottom = '-9999px';
      container.style.right = '-9999px';
      container.style.width = '200px';
      container.style.height = '200px';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-999';
      document.body.appendChild(container);
    }

    return new Promise((resolve) => {
      const initPlayer = () => {
        if (!window.YT || !window.YT.Player) {
          setTimeout(initPlayer, 100);
          return;
        }

        try {
          this.player = new window.YT.Player(this.containerId, {
            height: '200',
            width: '200',
            videoId: this.currentVideoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
            },
            events: {
              onReady: () => {
                this.isPlayerReady = true;
                this.player.setVolume(this.volumeLevel);
                if (this.isPlayingState) {
                  this.player.playVideo();
                }
                resolve();
              },
              onStateChange: (event: any) => {
                // YT.PlayerState.ENDED is 0
                if (event.data === 0) {
                  this.isPlayingState = false;
                  if (this.onEndedCallback) {
                    this.onEndedCallback();
                  }
                }
              },
              onError: (err: any) => {
                console.warn('YouTube Player Error:', err);
                resolve();
              },
            },
          });
        } catch (e) {
          console.warn('Failed to construct YT.Player:', e);
          resolve();
        }
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        const prevHandler = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevHandler) prevHandler();
          initPlayer();
        };
        // Fallback timeout in case API takes long or is offline/in test environment
        setTimeout(() => resolve(), 50);
      }
    });
  }

  private startTimeTracker(): void {
    if (this.timeUpdateInterval) clearInterval(this.timeUpdateInterval);
    this.timeUpdateInterval = setInterval(() => {
      if (this.isPlayingState) {
        const cur = this.getCurrentTime();
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(cur);
        }
      }
    }, 500);
  }

  private extractVideoId(urlOrId: string): string {
    if (!urlOrId) return 'dQw4w9WgXcQ';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  }
}
