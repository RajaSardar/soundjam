import React from 'react';
import { Track } from '../types';
import { ChevronUp, ChevronDown, ArrowUpToLine, Trash2, ListMusic, Play } from 'lucide-react';

interface QueueDeckProps {
  queue: Track[];
  currentUserId: string;
  isHost: boolean;
  onVote: (trackId: string, type: 'up' | 'down') => void;
  onPromote: (trackId: string) => void;
  onRemove: (trackId: string) => void;
  onPlayTrack?: (track: Track) => void;
}

export const QueueDeck: React.FC<QueueDeckProps> = ({
  queue,
  currentUserId,
  isHost,
  onVote,
  onPromote,
  onRemove,
  onPlayTrack,
}) => {
  const getBadgeClass = (source: string) => {
    switch (source) {
      case 'youtube':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'spotify':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'soundcloud':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'local':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <ListMusic className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Up Next
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {queue.length}
          </span>
        </div>

        <span className="text-xs text-slate-400">
          Ranked by votes
        </span>
      </div>

      {/* Queue List */}
      <div className="space-y-1.5 overflow-y-auto max-h-[520px] pr-1">
        {queue.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-xs">
            Queue is empty. Search tracks or add songs from YouTube & Spotify to jam together!
          </div>
        ) : (
          queue.map((track, index) => {
            const netVotes = (track.upvotes?.length || 0) - (track.downvotes?.length || 0);
            const hasUpvoted = track.upvotes?.includes(currentUserId);
            const hasDownvoted = track.downvotes?.includes(currentUserId);

            return (
              <div
                key={track.id}
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 transition"
              >
                {/* Index, Art & Title */}
                <div className="flex items-center space-x-3 min-w-0 mr-2 flex-1">
                  <span className="text-xs font-mono font-medium text-slate-500 w-4 text-center">
                    {index + 1}
                  </span>

                  <div className="relative group/art flex-shrink-0">
                    <img
                      src={
                        track.coverArt ||
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80'
                      }
                      className="w-11 h-11 rounded-xl object-cover border border-white/10 shadow-sm"
                      alt={track.title}
                    />
                    {onPlayTrack && (
                      <button
                        onClick={() => onPlayTrack(track)}
                        className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover/art:opacity-100 flex items-center justify-center text-white transition"
                        title="Play now"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {track.title}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md border font-medium uppercase ${getBadgeClass(
                          track.source
                        )}`}
                      >
                        {track.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {track.artist} &bull; {formatDuration(track.duration)}
                    </p>
                  </div>
                </div>

                {/* Vote Controls & Host Actions */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {/* Up/Down Votes */}
                  <div className="flex items-center space-x-1 px-1.5 py-1 rounded-xl bg-slate-950/40 border border-white/5">
                    <button
                      onClick={() => onVote(track.id, 'up')}
                      className={`p-1 rounded-lg transition ${
                        hasUpvoted
                          ? 'text-emerald-400 bg-emerald-500/20'
                          : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                      }`}
                      title="Upvote"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    <span
                      className={`text-xs font-mono font-bold px-1 ${
                        netVotes > 0
                          ? 'text-emerald-400'
                          : netVotes < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {netVotes}
                    </span>

                    <button
                      onClick={() => onVote(track.id, 'down')}
                      className={`p-1 rounded-lg transition ${
                        hasDownvoted
                          ? 'text-rose-400 bg-rose-500/20'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                      }`}
                      title="Downvote"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Host Quick Actions */}
                  {isHost && (
                    <div className="flex items-center space-x-1 ml-1">
                      <button
                        onClick={() => onPromote(track.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Pin to top"
                      >
                        <ArrowUpToLine className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemove(track.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Remove track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
