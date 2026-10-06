import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ExternalLink, KeyRound, Sparkles } from 'lucide-react';

interface AccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpotifyTokenSaved: (token: string) => void;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({
  isOpen,
  onClose,
  onSpotifyTokenSaved,
}) => {
  const [spotifyToken, setSpotifyToken] = useState('');
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const spToken = localStorage.getItem('soundjam_spotify_token');
      if (spToken) {
        setSpotifyToken(spToken);
        setIsSpotifyConnected(true);
      }
      const ytUser = localStorage.getItem('soundjam_google_user');
      if (ytUser) {
        setGoogleUser(ytUser);
        setIsYouTubeConnected(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSpotifyToken = () => {
    if (spotifyToken.trim()) {
      localStorage.setItem('soundjam_spotify_token', spotifyToken.trim());
      setIsSpotifyConnected(true);
      onSpotifyTokenSaved(spotifyToken.trim());
    }
  };

  const handleDisconnectSpotify = () => {
    localStorage.removeItem('soundjam_spotify_token');
    setSpotifyToken('');
    setIsSpotifyConnected(false);
    onSpotifyTokenSaved('');
  };

  const handleConnectGoogle = () => {
    // Quick interactive sign-in simulation / storage
    const simulatedAccount = 'user@gmail.com';
    localStorage.setItem('soundjam_google_user', simulatedAccount);
    setGoogleUser(simulatedAccount);
    setIsYouTubeConnected(true);
  };

  const handleDisconnectGoogle = () => {
    localStorage.removeItem('soundjam_google_user');
    setGoogleUser(null);
    setIsYouTubeConnected(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl overflow-hidden flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connect Streaming Accounts</h3>
              <p className="text-xs text-slate-400">Stream your own music & playlists directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Cards */}
        <div className="space-y-4">
          {/* 1. SPOTIFY ACCOUNT CARD */}
          <div className="rounded-2xl bg-slate-950/60 border border-emerald-500/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">
                  🟢
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Spotify Premium & Web Player</span>
                    {isSpotifyConnected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Connected</span>
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Stream full tracks via official Web Playback SDK
                  </p>
                </div>
              </div>
            </div>

            {isSpotifyConnected ? (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-emerald-400 font-medium">
                  Active connection to Spotify Web SDK
                </span>
                <button
                  onClick={handleDisconnectSpotify}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={spotifyToken}
                    onChange={e => setSpotifyToken(e.target.value)}
                    placeholder="Enter Spotify Access Token or click Connect..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveSpotifyToken}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition flex items-center space-x-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>No login? 30s previews play automatically.</span>
                  <a
                    href="https://developer.spotify.com/documentation/web-playback-sdk/quick-start"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Developer token guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 2. YOUTUBE / GOOGLE ACCOUNT CARD */}
          <div className="rounded-2xl bg-slate-950/60 border border-red-500/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xl">
                  🔴
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>YouTube & YouTube Music</span>
                    {isYouTubeConnected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Connected</span>
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Stream background audio via integrated YouTube IFrame Player
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {isYouTubeConnected
                  ? `Logged in as ${googleUser}`
                  : 'Embedded Player active & ready to stream'}
              </span>
              {isYouTubeConnected ? (
                <button
                  onClick={handleDisconnectGoogle}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition flex items-center space-x-1.5"
                >
                  <span>Connect Google</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
