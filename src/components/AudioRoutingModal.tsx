import React, { useState } from 'react';
import { RoutingMode } from '../types';
import { X } from 'lucide-react';

interface AudioRoutingModalProps {
  isOpen: boolean;
  currentMode: RoutingMode;
  onSaveMode: (mode: RoutingMode) => void;
  onClose: () => void;
}

export const AudioRoutingModal: React.FC<AudioRoutingModalProps> = ({
  isOpen,
  currentMode,
  onSaveMode,
  onClose,
}) => {
  const [selected, setSelected] = useState<RoutingMode>(currentMode);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveMode(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Audio Output Routing</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Party Mesh */}
          <label
            onClick={() => setSelected('mesh')}
            className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${
              selected === 'mesh'
                ? 'border-purple-500 bg-purple-900/30'
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40'
            }`}
          >
            <input
              type="radio"
              name="route"
              checked={selected === 'mesh'}
              onChange={() => setSelected('mesh')}
              className="mt-1 accent-purple-500"
            />
            <div>
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>🎉 Party Mesh (Synchronized Sound)</span>
                {selected === 'mesh' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500 text-white">
                    Active
                  </span>
                )}
              </span>
              <p className="text-[11px] text-slate-300 mt-1">
                This device plays music in sub-millisecond sync with every other phone/speaker in the jam.
              </p>
            </div>
          </label>

          {/* Host Aux Only */}
          <label
            onClick={() => setSelected('host_only')}
            className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${
              selected === 'host_only'
                ? 'border-purple-500 bg-purple-900/30'
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40'
            }`}
          >
            <input
              type="radio"
              name="route"
              checked={selected === 'host_only'}
              onChange={() => setSelected('host_only')}
              className="mt-1 accent-purple-500"
            />
            <div>
              <span className="text-xs font-bold text-white">
                📢 Host Aux / TV Only (Remote Mode)
              </span>
              <p className="text-[11px] text-slate-300 mt-1">
                Mute audio on this phone. Use this device as a wireless controller to queue and vote while host plays on the main stereo.
              </p>
            </div>
          </label>

          {/* Personal Headphones */}
          <label
            onClick={() => setSelected('personal')}
            className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition ${
              selected === 'personal'
                ? 'border-purple-500 bg-purple-900/30'
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40'
            }`}
          >
            <input
              type="radio"
              name="route"
              checked={selected === 'personal'}
              onChange={() => setSelected('personal')}
              className="mt-1 accent-purple-500"
            />
            <div>
              <span className="text-xs font-bold text-white">
                🎧 Personal Headphones (Silent Disco)
              </span>
              <p className="text-[11px] text-slate-300 mt-1">
                Independent volume, custom EQ boost, synchronized with the group.
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition"
        >
          Apply Output Route
        </button>
      </div>
    </div>
  );
};
