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
  latencyOffsetMs: number;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onOpenCalibration: () => void;
}

export const BottomPlayerBar: React.FC<BottomPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  latencyOffsetMs,
  onPlayPause,
  onSeek,
  onPrevious,
  onNext,
  onVolumeChange,
  onToggleMute,
  onOpenCalibration,
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
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0d1322]/95 backdrop-blur-xl border-t border-purple-500/30 px-4 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col space-y-1.5">
        {/* Scrubber & Duration */}
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <div
            onClick={handleScrubberClick}
            className="relative flex-1 h-2 bg-slate-800 rounded-full cursor-pointer group"
          >
            <div
              className="absolute h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md -translate-x-1/2 opacity-0 group-hover:opacity-100 transition"
              style={{ left: `${progressPercent}%` }}
            ></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Transport & Controls */}
        <div className="flex items-center justify-between">
          {/* Mini Track Info */}
          <div className="flex items-center space-x-3 min-w-0 w-1/4">
            <img
              src={
                currentTrack?.coverArt ||
                'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop&q=80'
              }
              alt="Mini Cover"
              className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0"
            />
            <div className="min-w-0 hidden sm:block">
              <p className="text-xs font-bold text-white truncate">
                {currentTrack?.title || 'Ready to Jam'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentTrack?.artist || 'SoundJam'}
              </p>
            </div>
          </div>

          {/* Center Playback Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onPrevious}
              className="text-slate-400 hover:text-white transition p-1.5"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="text-slate-400 hover:text-white transition p-1.5"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right Volume & Offset */}
          <div className="flex items-center justify-end space-x-3 w-1/4">
            <div className="hidden md:flex items-center space-x-2">
              <button onClick={onToggleMute} className="text-slate-400 hover:text-white">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={e => onVolumeChange(Number(e.target.value) / 100)}
                className="w-20 accent-purple-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={onOpenCalibration}
              className="px-2.5 py-1 rounded-md bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-[11px] font-mono text-purple-300"
            >
              Offset: {latencyOffsetMs > 0 ? `+${latencyOffsetMs}` : latencyOffsetMs}ms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
