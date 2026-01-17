import React from 'react';
import { 
  // Existing
  Apple, Coffee, Utensils, Home, Smile, User, Heart, Star, Sun, Moon, Zap, Plus,
  // New Requested
  AlertCircle, XCircle, CheckCircle, Play, Pause, ArrowRight, ArrowLeft, Clock, 
  Calendar, MapPin, BedDouble, Shirt, Smartphone, DollarSign, Users, Stethoscope, 
  Music, Book, Tv, Phone, Bath
} from 'lucide-react';

interface PictureGridProps {
  onSelect: (label: string) => void;
}

const ICONS = [
  // Essentials
  { id: 'yes', label: 'Yes', icon: CheckCircle, color: 'text-emerald-400' },
  { id: 'no', label: 'No', icon: XCircle, color: 'text-rose-500' },
  { id: 'help', label: 'Help', icon: AlertCircle, color: 'text-red-500' },
  { id: 'stop', label: 'Stop', icon: Pause, color: 'text-rose-400' },
  { id: 'go', label: 'Go', icon: ArrowRight, color: 'text-emerald-400' },

  // Needs
  { id: 'hungry', label: 'Hungry', icon: Utensils, color: 'text-orange-400' },
  { id: 'thirsty', label: 'Thirsty', icon: Coffee, color: 'text-sky-400' },
  { id: 'toilet', label: 'Toilet', icon: Bath, color: 'text-cyan-400' },
  { id: 'pain', label: 'Pain', icon: AlertCircle, color: 'text-red-600' },
  { id: 'tired', label: 'Tired', icon: BedDouble, color: 'text-indigo-400' },
  { id: 'clothes', label: 'Clothes', icon: Shirt, color: 'text-violet-400' },

  // Feelings
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-yellow-400' },
  { id: 'sad', label: 'Sad', icon: Moon, color: 'text-indigo-300' },
  { id: 'angry', label: 'Angry', icon: Zap, color: 'text-yellow-600' },
  { id: 'good', label: 'Good', icon: Star, color: 'text-amber-400' },
  { id: 'bad', label: 'Bad', icon: XCircle, color: 'text-orange-600' },

  // People
  { id: 'me', label: 'Me', icon: User, color: 'text-blue-400' },
  { id: 'you', label: 'You', icon: Users, color: 'text-sky-400' },
  { id: 'family', label: 'Family', icon: Heart, color: 'text-pink-400' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-teal-400' },

  // Places
  { id: 'home', label: 'Home', icon: Home, color: 'text-emerald-400' },
  { id: 'outside', label: 'Outside', icon: Sun, color: 'text-orange-400' },
  { id: 'school', label: 'School', icon: Book, color: 'text-blue-500' },
  { id: 'store', label: 'Shop', icon: DollarSign, color: 'text-green-400' },
  { id: 'here', label: 'Here', icon: MapPin, color: 'text-red-400' },

  // Actions
  { id: 'want', label: 'Want', icon: Plus, color: 'text-slate-300' },
  { id: 'look', label: 'Look', icon: Tv, color: 'text-purple-400' },
  { id: 'listen', label: 'Listen', icon: Music, color: 'text-fuchsia-400' },
  { id: 'play', label: 'Play', icon: Play, color: 'text-lime-400' },
  { id: 'call', label: 'Phone', icon: Phone, color: 'text-green-500' },
  { id: 'time', label: 'Time', icon: Clock, color: 'text-slate-400' },
  { id: 'date', label: 'Date', icon: Calendar, color: 'text-blue-300' },
];

export default function PictureGrid({ onSelect }: PictureGridProps) {
  return (
    <div className="w-full h-full grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 overflow-y-auto p-4 custom-scrollbar">
      {ICONS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.label)}
          className="
            group flex flex-col items-center justify-center
            aspect-square rounded-2xl bg-slate-800 border border-slate-700/50
            hover:bg-slate-700 hover:border-slate-500 hover:scale-105 hover:shadow-xl hover:shadow-black/20
            active:scale-95 active:bg-slate-600
            transition-all duration-200 ease-out
          "
        >
          <div className="p-2.5 rounded-xl bg-slate-900/40 group-hover:bg-slate-900/60 transition-colors mb-2">
            <item.icon className={`w-8 h-8 ${item.color} opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300`} />
          </div>
          
          <span className="text-sm font-semibold text-slate-300 group-hover:text-white tracking-wide truncate w-full px-2">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
