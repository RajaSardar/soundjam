import React from 'react';
import { RoutingMode } from '../types';
import { Music, Radio, Clock, Share2 } from 'lucide-react';

interface HeaderProps {
  roomId: string;
  deviceCount: number;
  syncOffsetMs: number;
  routingMode: RoutingMode;
  onOpenRouting: () => void;
  onOpenCalibration: () => void;
  onOpenShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  deviceCount,
  syncOffsetMs,
  routingMode,
  onOpenRouting,
  onOpenCalibration,
  onOpenShare,
}) => {
  const getRoutingLabel = () => {
    switch (routingMode) {
      case 'mesh':
        return 'Party Mesh (Sync)';
      case 'host_only':
        return 'Host Aux (Muted)';
      case 'personal':
        return 'Headphones';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/85 backdrop-blur-md border-b border-purple-900/30 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* App Logo */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-900/30">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-purple-400 via-cyan-300 to-white bg-clip-text text-transparent">
              SoundJam
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-medium">
              {roomId}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{deviceCount} devices in sync</span>
            <span className="text-purple-400/80 font-mono">
              ({syncOffsetMs >= 0 ? `+${syncOffsetMs}` : syncOffsetMs}ms)
            </span>
          </p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenRouting}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition shadow-sm"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>{getRoutingLabel()}</span>
        </button>

        <button
          onClick={onOpenCalibration}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition"
          title="Latency Calibration"
        >
          <Clock className="w-4 h-4 text-purple-400" />
        </button>

        <button
          onClick={onOpenShare}
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition shadow-md shadow-purple-600/30 flex items-center space-x-1"
          title="Invite Friends"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Invite</span>
        </button>
      </div>
    </header>
  );
};
