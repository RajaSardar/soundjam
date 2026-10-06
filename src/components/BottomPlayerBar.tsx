import React from 'react';
import { Track } from '../types';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface BottomPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onOpenNowPlaying?: () => void;
}

export const BottomPlayerBar: React.FC<BottomPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onPrevious,
  onNext,
  onVolumeChange,
  onToggleMute,
  onOpenNowPlaying,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0d1322]/95 backdrop-blur-2xl border-t border-white/5 px-4 sm:px-6 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col space-y-1.5">
        {/* Scrubber Progress Bar */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <div
            onClick={handleScrubberClick}
            className="relative flex-1 h-1.5 bg-slate-800 hover:h-2 rounded-full cursor-pointer group transition-all"
          >
            <div
              className="absolute h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md -translate-x-1/2 opacity-0 group-hover:opacity-100 transition"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>

        {/* Player Controls Bar */}
        <div className="flex items-center justify-between">
          {/* Track Info (Left) */}
          <div
            onClick={onOpenNowPlaying}
            className="flex items-center space-x-3 min-w-0 w-1/3 cursor-pointer group"
          >
            <img
              src={
                currentTrack?.coverArt ||
                'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop&q=80'
              }
              alt="Mini Cover"
              className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0 group-hover:scale-105 transition"
            />
            <div className="min-w-0 pr-2">
              <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-300 transition">
                {currentTrack?.title || 'Ready to Jam'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentTrack?.artist || 'SoundJam Engine'}
              </p>
            </div>
          </div>

          {/* Transport Controls (Center) */}
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <button
              onClick={onPrevious}
              className="text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-slate-800/60"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-slate-950 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-slate-800/60"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Volume Control (Right) */}
          <div className="flex items-center justify-end space-x-2 w-1/3">
            <button
              onClick={onToggleMute}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={e => onVolumeChange(Number(e.target.value) / 100)}
              className="w-16 sm:w-24 accent-purple-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
