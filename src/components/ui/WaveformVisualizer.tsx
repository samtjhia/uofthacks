import React, { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
}

export default function WaveformVisualizer({ isActive }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(30).fill(10));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(30).fill(10));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.max(10, Math.random() * 100)));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-end justify-center gap-1 h-full w-full px-10 pb-2">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full transition-all duration-300 ease-in-out ${
            isActive 
              ? 'bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' 
              : 'bg-slate-700/50'
          }`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
