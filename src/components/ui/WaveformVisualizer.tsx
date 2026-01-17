import React from 'react';
import { useStore } from '@/store/useStore';

interface WaveformVisualizerProps {
  isActive: boolean;
}

export default function WaveformVisualizer({ isActive }: WaveformVisualizerProps) {
  const audioLevel = useStore((state) => state.audioLevel);
  const barsCount = 30;

  return (
    <div className="flex items-end justify-center gap-1 h-full w-full px-10 pb-2">
      {Array.from({ length: barsCount }).map((_, i) => {
        // Calculate symmetry and multiplier
        const center = barsCount / 2;
        const distanceFromCenter = Math.abs(i - center);
        
        // Bell curve falloff for symmetry
        const normalizedDistance = distanceFromCenter / (barsCount / 2);
        const falloff = Math.exp(-2.5 * normalizedDistance * normalizedDistance);
        
        // "Creative jitter" - pseudo-random but deterministic based on index
        const texture = 0.85 + 0.3 * Math.sin(i * 0.8) + 0.15 * Math.cos(i * 2.3);
        
        const multiplier = falloff * texture * 2.0;

        const effectiveLevel = isActive ? audioLevel : 0;
        
        // Calculate height
        const percentage = (effectiveLevel / 255) * 100;
        const barHeight = Math.min(100, Math.max(10, percentage * multiplier));

        return (
          <div
            key={i}
            className={`flex-1 rounded-full transition-[height] duration-75 ease-out ${
              isActive 
                ? 'bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]' 
                : 'bg-slate-700/50'
            }`}
            style={{ height: `${barHeight}%` }}
          />
        );
      })}
    </div>
  );
}
