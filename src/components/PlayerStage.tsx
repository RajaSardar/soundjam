import React, { useState } from 'react';
import { Track } from '../types';
import { FastForward, Heart, Music, Sparkles } from 'lucide-react';

interface PlayerStageProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  skipVotes: string[];
  skipVotesRequired: number;
  currentUserId: string;
  analyser?: AnalyserNode | null;
  onVoteSkip: () => void;
  onSendReaction: (emoji: string) => void;
  onOpenSearch?: () => void;
}

export const PlayerStage: React.FC<PlayerStageProps> = ({
  currentTrack,
  isPlaying,
  skipVotes,
  skipVotesRequired,
  currentUserId,
  onVoteSkip,
  onSendReaction,
  onOpenSearch,
}) => {
  const [activeEmojis, setActiveEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  const hasVotedSkip = skipVotes.includes(currentUserId);

  const handleEmojiClick = (emoji: string) => {
    const newBubble = {
      id: Date.now() + Math.random(),
      emoji,
      left: 30 + Math.random() * 40,
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
        return { label: 'YouTube Music', color: 'bg-red-500/15 border-red-500/30 text-red-400', icon: '🔴' };
      case 'spotify':
        return { label: 'Spotify', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', icon: '🟢' };
      case 'soundcloud':
        return { label: 'SoundCloud', color: 'bg-amber-500/15 border-amber-500/30 text-amber-400', icon: '🟠' };
      case 'local':
        return { label: 'Local Audio', color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400', icon: '📁' };
      default:
        return { label: 'Stream', color: 'bg-purple-500/15 border-purple-500/30 text-purple-400', icon: '🎵' };
    }
  };

  const badge = getSourceBadge(currentTrack?.source);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Ambient background glow matching album cover */}
      <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] my-3">
        {/* Glow backdrop */}
        <div
          className={`absolute -inset-4 rounded-3xl bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-pink-600/30 blur-2xl transition-opacity duration-1000 ${
            isPlaying ? 'opacity-90 scale-105' : 'opacity-30'
          }`}
        />

        {/* Floating animated reaction bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {activeEmojis.map(item => (
            <div
              key={item.id}
              className="emoji-bubble text-3xl select-none"
              style={{ left: `${item.left}%`, bottom: '20px' }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Crisp Rounded Album Artwork */}
        <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 group">
          {currentTrack?.coverArt ? (
            <img
              src={currentTrack.coverArt}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-100' : 'scale-98 opacity-85'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 p-6 text-center">
              <Music className="w-16 h-16 mb-3 text-purple-400/60 animate-pulse" />
              <p className="text-sm font-medium text-slate-300">No Track Playing</p>
              {onOpenSearch && (
                <button
                  onClick={onOpenSearch}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover Music</span>
                </button>
              )}
            </div>
          )}

          {/* Source pill in top-left */}
          {currentTrack && (
            <div className="absolute top-4 left-4 z-20">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border shadow-lg ${badge.color}`}
              >
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </span>
            </div>
          )}

          {/* Like button in top-right */}
          {currentTrack && (
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/50 backdrop-blur-md text-white/80 hover:text-white hover:scale-110 active:scale-90 transition border border-white/10"
              title="Save to favorites"
            >
              <Heart
                className={`w-4 h-4 transition ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Track Metadata - Clean & Elegant */}
      <div className="w-full text-center mt-3 px-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate drop-shadow-sm">
          {currentTrack?.title || 'Ready to Jam'}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 font-medium truncate mt-1">
          {currentTrack?.artist || 'Search Spotify, YouTube, or Apple Music'}
        </p>

        {currentTrack && (
          <div className="inline-flex items-center space-x-1.5 mt-2 px-3 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <span className="text-slate-400">Added by</span>
            <span className="font-semibold text-purple-300">{currentTrack.addedBy.name}</span>
          </div>
        )}
      </div>

      {/* Clean Interactive Action Bar: Skip Vote & Quick Reactions */}
      <div className="w-full flex items-center justify-between mt-5 px-3 py-2 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm">
        {/* Quick Reactions */}
        <div className="flex items-center space-x-1">
          {['🔥', '❤️', '⚡', '💃'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-800/80 hover:scale-110 active:scale-95 transition text-base"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Skip Vote Pill */}
        <button
          onClick={onVoteSkip}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition ${
            hasVotedSkip
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border-slate-700/50'
          }`}
          title="Vote to skip current track"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>
            Skip ({skipVotes.length}/{skipVotesRequired})
          </span>
        </button>
      </div>
    </div>
  );
};
