import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2 } from 'lucide-react';

interface LatencyCalibrationModalProps {
  isOpen: boolean;
  currentOffset: number;
  onSaveOffset: (offset: number) => void;
  onClose: () => void;
}

export const LatencyCalibrationModal: React.FC<LatencyCalibrationModalProps> = ({
  isOpen,
  currentOffset,
  onSaveOffset,
  onClose,
}) => {
  const [offset, setOffset] = useState(currentOffset);
  const [isBeepTesting, setIsBeepTesting] = useState(false);
  const beepIntervalRef = useRef<any>(null);

  useEffect(() => {
    setOffset(currentOffset);
  }, [currentOffset]);

  useEffect(() => {
    return () => {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const playClickBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('AudioContext interaction required', e);
    }
  };

  const toggleBeepTest = () => {
    if (isBeepTesting) {
      setIsBeepTesting(false);
      clearInterval(beepIntervalRef.current);
    } else {
      setIsBeepTesting(true);
      playClickBeep();
      beepIntervalRef.current = setInterval(playClickBeep, 1000);
    }
  };

  const handleSave = () => {
    if (isBeepTesting) {
      setIsBeepTesting(false);
      clearInterval(beepIntervalRef.current);
    }
    onSaveOffset(offset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span>Audio Sync & Latency Calibration</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Bluetooth speakers or different phone models may introduce a 100ms - 250ms buffer delay.
          Calibrate your device offset so all speakers in the room beat in exact unison.
        </p>

        {/* METRONOME CLICK TEST */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white">Audible Sync Metronome</span>
            <p className="text-[11px] text-slate-400">Plays a synchronized beep every 1.0 second</p>
          </div>
          <button
            onClick={toggleBeepTest}
            className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition flex items-center space-x-1 ${
              isBeepTesting ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isBeepTesting ? 'Stop Click' : 'Start Click'}</span>
          </button>
        </div>

        {/* OFFSET SLIDER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Hardware Latency Compensation:</span>
            <span className="font-mono font-bold text-cyan-300">
              {offset > 0 ? `+${offset}` : offset} ms
            </span>
          </div>
          <input
            type="range"
            min="-300"
            max="300"
            step="5"
            value={offset}
            onChange={e => setOffset(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-300ms (Lead)</span>
            <span>0ms (Wired)</span>
            <span>+300ms (Bluetooth Delay)</span>
          </div>
        </div>

        {/* PRESETS */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            onClick={() => setOffset(0)}
            className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
          >
            Speaker (0ms)
          </button>
          <button
            onClick={() => setOffset(140)}
            className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
          >
            JBL (+140ms)
          </button>
          <button
            onClick={() => setOffset(220)}
            className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700"
          >
            AirPods (+220ms)
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition"
          >
            Save Calibration
          </button>
        </div>
      </div>
    </div>
  );
};
