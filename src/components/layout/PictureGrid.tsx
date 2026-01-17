import React from 'react';
import { Apple, Coffee, Utensils, Home, Smile, User, Heart, Star, Sun, Moon, Zap, Plus } from 'lucide-react';

interface PictureGridProps {
  onSelect: (label: string) => void;
}

const ICONS = [
  { id: '1', label: 'Hungry', icon: Utensils, color: 'text-orange-400' },
  { id: '2', label: 'Thirsty', icon: Coffee, color: 'text-blue-400' },
  { id: '3', label: 'Food', icon: Apple, color: 'text-red-400' },
  { id: '4', label: 'Home', icon: Home, color: 'text-emerald-400' },
  { id: '5', label: 'Happy', icon: Smile, color: 'text-yellow-400' },
  { id: '6', label: 'Me', icon: User, color: 'text-purple-400' },
  { id: '7', label: 'Love', icon: Heart, color: 'text-pink-400' },
  { id: '8', label: 'Good', icon: Star, color: 'text-amber-400' },
  { id: '9', label: 'Day', icon: Sun, color: 'text-orange-300' },
  { id: '10', label: 'Night', icon: Moon, color: 'text-indigo-400' },
  { id: '11', label: 'Spark', icon: Zap, color: 'text-yellow-300' },
  { id: '12', label: 'Add', icon: Plus, color: 'text-slate-400' },
];

export default function PictureGrid({ onSelect }: PictureGridProps) {
  return (
    <div className="w-full h-full p-4 grid grid-cols-4 gap-4 overflow-y-auto">
      {ICONS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.label)}
          className="group relative aspect-square rounded-2xl border border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center gap-2 hover:border-neon-green/50 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
        >
          <item.icon className={`w-10 h-10 ${item.color} transition-transform group-hover:scale-110`} />
          <span className="font-bold text-slate-300 text-sm group-hover:text-white">{item.label}</span>
          
          {/* Highlight Glow Effect (Placeholder) */}
          <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-neon-green/30 transition-all" />
        </button>
      ))}
    </div>
  );
}
