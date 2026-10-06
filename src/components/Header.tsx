import React from 'react';
import { RoutingMode } from '../types';
import { Music, Radio, Sliders, Share2, Disc3, ListMusic, Search, LogIn } from 'lucide-react';

export type MainTab = 'player' | 'queue' | 'search';

interface HeaderProps {
  roomId: string;
  deviceCount: number;
  syncOffsetMs: number;
  routingMode: RoutingMode;
  activeTab: MainTab;
  queueCount: number;
  onTabChange: (tab: MainTab) => void;
  onOpenRouting: () => void;
  onOpenCalibration: () => void;
  onOpenShare: () => void;
  onOpenAccounts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  deviceCount,
  activeTab,
  queueCount,
  onTabChange,
  onOpenRouting,
  onOpenCalibration,
  onOpenShare,
  onOpenAccounts,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Room Info */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-white">SoundJam</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono font-medium">
                {roomId}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{deviceCount} in sync</span>
            </p>
          </div>
        </div>

        {/* Center Clean View Switcher Navigation */}
        <nav className="flex items-center p-1 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
          <button
            onClick={() => onTabChange('player')}
            className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'player'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Now Playing</span>
          </button>

          <button
            onClick={() => onTabChange('queue')}
            className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'queue'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue</span>
            {queueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {queueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('search')}
            className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'search'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </nav>

        {/* Right Action Icons: Accounts, Routing, Sync, Invite */}
        <div className="flex items-center space-x-2">
          {/* Connect Accounts Button */}
          <button
            onClick={onOpenAccounts}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 hover:text-white transition shadow-sm"
            title="Connect Spotify & YouTube Accounts"
          >
            <LogIn className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Connect</span>
          </button>

          {/* Audio Mesh / Routing */}
          <button
            onClick={onOpenRouting}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition"
            title="Audio Routing & Devices"
          >
            <Radio className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Sync Calibration */}
          <button
            onClick={onOpenCalibration}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition"
            title="Latency Calibration"
          >
            <Sliders className="w-4 h-4 text-purple-400" />
          </button>

          {/* Share / Invite */}
          <button
            onClick={onOpenShare}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition shadow-md shadow-purple-600/30 flex items-center space-x-1.5"
            title="Invite Friends"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Invite</span>
          </button>
        </div>
      </div>
    </header>
  );
};
