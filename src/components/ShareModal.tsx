import React, { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  roomId: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, roomId, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `https://soundjam.live/jam/${roomId}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Invite Friends to Jam</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Scan QR Code with any phone camera to join the session without installing an app.
        </p>

        {/* QR CODE PREVIEW */}
        <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center">
          <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
            <rect x="10" y="10" width="25" height="25" fill="#000" />
            <rect x="15" y="15" width="15" height="15" fill="#fff" />
            <rect x="18" y="18" width="9" height="9" fill="#000" />

            <rect x="65" y="10" width="25" height="25" fill="#000" />
            <rect x="70" y="15" width="15" height="15" fill="#fff" />
            <rect x="73" y="18" width="9" height="9" fill="#000" />

            <rect x="10" y="65" width="25" height="25" fill="#000" />
            <rect x="15" y="70" width="15" height="15" fill="#fff" />
            <rect x="18" y="73" width="9" height="9" fill="#000" />

            <rect x="40" y="15" width="10" height="20" fill="#000" />
            <rect x="45" y="45" width="15" height="15" fill="#000" />
            <rect x="65" y="65" width="20" height="10" fill="#000" />
            <rect x="40" y="70" width="10" height="15" fill="#000" />
            <rect x="75" y="40" width="15" height="10" fill="#000" />
          </svg>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-purple-300 font-bold truncate max-w-[200px]">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-sans text-[11px] flex items-center space-x-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
};
