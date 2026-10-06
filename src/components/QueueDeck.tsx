import React from 'react';
import { Track } from '../types';
import { ChevronUp, ChevronDown, ArrowUpToLine, Trash2 } from 'lucide-react';

interface QueueDeckProps {
  queue: Track[];
  currentUserId: string;
  isHost: boolean;
  onVote: (trackId: string, type: 'up' | 'down') => void;
  onPromote: (trackId: string) => void;
  onRemove: (trackId: string) => void;
}

export const QueueDeck: React.FC<QueueDeckProps> = ({
  queue,
  currentUserId,
  isHost,
  onVote,
  onPromote,
  onRemove,
}) => {
  const getBadgeClass = (source: string) => {
    switch (source) {
      case 'youtube':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'spotify':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'soundcloud':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'local':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 rounded-2xl bg-slate-900/80 border border-purple-500/20 p-4 shadow-xl backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Unified Jam Queue
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-medium">
            {queue.length} tracks
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Sort:</span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/30 font-medium">
            Top Voted 🔥
          </span>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
        {queue.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Queue is empty. Search tracks above or upload an audio file to start jamming!
          </div>
        ) : (
          queue.map((track, index) => {
            const netVotes = (track.upvotes?.length || 0) - (track.downvotes?.length || 0);
            const hasUpvoted = track.upvotes?.includes(currentUserId);
            const hasDownvoted = track.downvotes?.includes(currentUserId);

            return (
              <div
                key={track.id}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 transition duration-150"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-slate-500 w-4 text-center">
                    #{index + 1}
                  </span>
                  <img
                    src={
                      track.coverArt ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80'
                    }
                    className="w-11 h-11 rounded-lg object-cover border border-slate-700/60 flex-shrink-0 shadow-sm"
                    alt={track.title}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-slate-100 truncate">{track.title}</p>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold uppercase ${getBadgeClass(
                          track.source
                        )}`}
                      >
                        {track.source}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {track.artist} &bull; {formatDuration(track.duration)}
                    </p>
                    <span className="text-[10px] text-purple-400 flex items-center space-x-1 mt-0.5">
                      <span>By {track.addedBy.name}</span>
                    </span>
                  </div>
                </div>

                {/* Vote & Action Buttons */}
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <div className="flex flex-col items-center mr-1">
                    <button
                      onClick={() => onVote(track.id, 'up')}
                      className={`p-1 rounded transition ${
                        hasUpvoted ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                      }`}
                      title="Upvote"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`text-xs font-mono font-bold ${
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
                      className={`p-1 rounded transition ${
                        hasDownvoted ? 'text-rose-400 bg-rose-500/20' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-700'
                      }`}
                      title="Downvote"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Host Actions */}
                  {isHost && (
                    <>
                      <button
                        onClick={() => onPromote(track.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/40 border border-slate-700 text-slate-300 hover:text-white transition"
                        title="Promote to top"
                      >
                        <ArrowUpToLine className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemove(track.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/40 border border-slate-700 text-slate-400 hover:text-rose-300 transition"
                        title="Remove track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Banner */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Tip: Upvote your favorites to push them up the queue!</span>
        <span className="text-cyan-400 font-mono">Democracy Mode Active</span>
      </div>
    </div>
  );
};
