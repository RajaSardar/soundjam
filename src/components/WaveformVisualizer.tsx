import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  analyser?: AnalyserNode | null;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying, analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;
    const barCount = 48;

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const render = () => {
      // Battery saver: pause rendering if tab is hidden
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / barCount;

      if (analyser && dataArray && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < barCount; i++) {
        let heightMultiplier = 0.08;
        if (isPlaying) {
          if (dataArray) {
            const index = Math.floor((i / barCount) * (dataArray.length / 4));
            heightMultiplier = (dataArray[index] / 255) * 0.85 + 0.1;
          } else {
            // Simulated pulse wave
            heightMultiplier = Math.sin(phase + i * 0.25) * 0.4 + 0.5 + Math.random() * 0.15;
          }
        }

        const barHeight = heightMultiplier * canvas.height * 0.85;
        const x = i * barWidth;
        const y = (canvas.height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(1, '#06b6d4');

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1.5, y, barWidth - 3, barHeight);
      }

      phase += 0.08;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, analyser]);

  return (
    <div className="w-full h-12 my-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={48}
        className="w-full h-full rounded-lg bg-slate-950/40 border border-slate-800/60"
      />
    </div>
  );
};
