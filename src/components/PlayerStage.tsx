import React, { useState } from 'react';
import { Track } from '../types';
import { WaveformVisualizer } from './WaveformVisualizer';
import { FastForward } from 'lucide-react';

interface PlayerStageProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  skipVotes: string[];
  skipVotesRequired: number;
  currentUserId: string;
  analyser?: AnalyserNode | null;
  onVoteSkip: () => void;
  onSendReaction: (emoji: string) => void;
}

export const PlayerStage: React.FC<PlayerStageProps> = ({
  currentTrack,
  isPlaying,
  skipVotes,
  skipVotesRequired,
  currentUserId,
  analyser,
  onVoteSkip,
  onSendReaction,
}) => {
  const [hypeCount, setHypeCount] = useState(142);
  const [activeEmojis, setActiveEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);

  const hasVotedSkip = skipVotes.includes(currentUserId);

  const handleEmojiClick = (emoji: string) => {
    setHypeCount(prev => prev + 1);
    const newBubble = {
      id: Date.now() + Math.random(),
      emoji,
      left: 20 + Math.random() * 60,
    };
    setActiveEmojis(prev => [...prev, newBubble]);
    setTimeout(() => {
      setActiveEmojis(prev => prev.filter(e => e.id !== newBubble.id));
    }, 1800);
    onSendReaction(emoji);
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'youtube':
        return { label: 'YouTube Audio', color: 'bg-red-500/10 border-red-500/30 text-red-400' };
      case 'spotify':
        return { label: 'Spotify Track', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
      case 'soundcloud':
        return { label: 'SoundCloud VIP', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
      case 'local':
        return { label: 'Local Lossless', color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' };
      default:
        return { label: 'Web Stream', color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' };
    }
  };

  const badge = getSourceBadge(currentTrack?.source);

  return (
    <div className="flex flex-col space-y-5">
      {/* HERO NOW PLAYING CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-[#131a2e]/90 to-slate-900/90 border border-purple-500/20 p-5 shadow-2xl backdrop-blur-xl flex flex-col items-center">
        {/* Floating emojis stage */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {activeEmojis.map(item => (
            <div
              key={item.id}
              className="emoji-bubble text-3xl"
              style={{ left: `${item.left}%`, bottom: '20px' }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Source Badge & Quality Pill */}
        <div className="w-full flex items-center justify-between mb-4">
          <span
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.color}`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
            <span>{badge.label}</span>
          </span>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              FLAC • 48kHz
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Sync Locked
            </span>
          </div>
        </div>

        {/* VINYL / ALBUM ARTWORK CONTAINER */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 my-2 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-purple-600/20 blur-2xl transition duration-700 scale-110 ${
              isPlaying ? 'opacity-100' : 'opacity-20'
            }`}
          ></div>

          {/* Vinyl Ring */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border-4 border-slate-700/60 shadow-2xl flex items-center justify-center ${
              isPlaying ? 'animate-spin-slow' : 'animate-spin-slow paused'
            }`}
          >
            <div className="w-full h-full rounded-full border border-slate-600/20 flex items-center justify-center p-3">
              <div className="w-full h-full rounded-full border border-slate-600/30 flex items-center justify-center p-3">
                <div className="w-full h-full rounded-full border border-slate-600/20"></div>
              </div>
            </div>
          </div>

          {/* Album Art */}
          <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-slate-900 shadow-xl flex items-center justify-center">
            <img
              src={
                currentTrack?.coverArt ||
                'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80'
              }
              alt="Album Cover"
              className="w-full h-full object-cover"
            />
            {/* Center Spindle Hole */}
            <div className="absolute w-5 h-5 rounded-full bg-slate-950 border-2 border-slate-600"></div>
          </div>
        </div>

        {/* Real-time Spectrum Canvas */}
        <WaveformVisualizer isPlaying={isPlaying} analyser={analyser} />

        {/* Track Info */}
        <div className="w-full text-center mt-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
            {currentTrack?.title || 'No Track Selected'}
          </h2>
          <p className="text-sm text-purple-300 font-medium truncate mt-0.5">
            {currentTrack?.artist || 'Add a song to start the jam session'}
          </p>
          {currentTrack && (
            <div className="flex items-center justify-center space-x-2 mt-2">
              <span className="text-xs text-slate-400">Added by:</span>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>{currentTrack.addedBy.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Reaction Emoji Burst Bar */}
        <div className="w-full flex items-center justify-center space-x-3 mt-4 pt-3 border-t border-slate-800/80">
          {['🔥', '❤️', '⚡', '💃', '🎧'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-lg hover:scale-110 active:scale-95 transition"
            >
              {emoji}
            </button>
          ))}
          <span className="text-xs text-slate-400 font-mono ml-2">{hypeCount} hypes</span>
        </div>
      </div>

      {/* DEMOCRATIC SKIP VOTING CARD */}
      <div className="rounded-xl bg-slate-900/60 border border-purple-900/20 p-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300">Vote to Skip Track</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
              {skipVotes.length} / {skipVotesRequired} votes
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Majority vote skips automatically</p>
        </div>
        <button
          onClick={onVoteSkip}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center space-x-1.5 ${
            hasVotedSkip
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-slate-800 hover:bg-rose-900/40 border-slate-700 hover:border-rose-500/50 text-rose-300'
          }`}
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>{hasVotedSkip ? 'Vote Counted ✓' : 'Cast Skip Vote'}</span>
        </button>
      </div>
    </div>
  );
};
