"use client";
import React from 'react';
import { useStore } from '@/store/useStore';
import { Apple, Coffee, Utensils, Play, Smile, Users, Home, CheckCircle, XCircle, Bath, Moon, Book, Tv, Music, Phone, Sun, Plus, AlertCircle, User, Trash2 } from 'lucide-react';

interface Props {
  category: string;
}

const ITEMS: Record<string, Array<{ id: string; label: string; icon: any }>> = {
  food: [
    { id: 'pizza', label: 'Pizza', icon: Apple },
    { id: 'pasta', label: 'Pasta', icon: Utensils },
    { id: 'sandwich', label: 'Sandwich', icon: Apple },
    { id: 'apple', label: 'Apple', icon: Apple },
    { id: 'banana', label: 'Banana', icon: Apple },
    { id: 'cookie', label: 'Cookie', icon: Apple },
  ],
  drinks: [
    { id: 'water', label: 'Water', icon: Coffee },
    { id: 'juice', label: 'Juice', icon: Coffee },
    { id: 'milk', label: 'Milk', icon: Coffee },
    { id: 'soda', label: 'Soda', icon: Coffee },
  ],
  activities: [
    { id: 'play', label: 'Play', icon: Play },
    { id: 'watch', label: 'Watch TV', icon: Tv },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'read', label: 'Read', icon: Book },
  ],
  people: [
    { id: 'mom', label: 'Mom', icon: Users },
    { id: 'dad', label: 'Dad', icon: Users },
    { id: 'teacher', label: 'Teacher', icon: Users },
    { id: 'friend', label: 'Friend', icon: Users },
  ],
  feelings: [
    { id: 'happy', label: 'Happy', icon: Smile },
    { id: 'sad', label: 'Sad', icon: Moon },
    { id: 'yes', label: 'Yes', icon: CheckCircle },
    { id: 'no', label: 'No', icon: XCircle },
  ],
  pronouns: [
    { id: 'i', label: 'I', icon: User },
    { id: 'me', label: 'Me', icon: User },
    { id: 'you', label: 'You', icon: Users },
    { id: 'he', label: 'He', icon: User },
    { id: 'she', label: 'She', icon: User },
    { id: 'they', label: 'They', icon: Users },
    { id: 'we', label: 'We', icon: Users },
  ],
  needs: [
    { id: 'hungry', label: 'Hungry', icon: Utensils },
    { id: 'thirsty', label: 'Thirsty', icon: Coffee },
    { id: 'toilet', label: 'Toilet', icon: Bath },
    { id: 'sleep', label: 'Tired', icon: Moon },
  ],
  places: [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'school', label: 'School', icon: Book },
    { id: 'park', label: 'Park', icon: Sun },
    { id: 'store', label: 'Shop', icon: Phone },
  ],
  actions: [
    { id: 'want', label: 'Want', icon: Plus },
    { id: 'more', label: 'More', icon: Plus },
    { id: 'stop', label: 'Stop', icon: XCircle },
    { id: 'help', label: 'Help', icon: AlertCircle },
  ],
};

export default function CategoryGrid({ category }: Props) {
  const { setTypedText, setPictureCategory, typedText, customItems, removeCustomItem } = useStore();

  const defaultItems = ITEMS[category] || [];
  const categoryCustomItems = customItems.filter(i => i.category.toLowerCase() === category.toLowerCase());
  
  // Normalize types for rendering
  const allItems = [
    ...defaultItems.map(i => ({ ...i, isCustom: false, imageUrl: null })),
    ...categoryCustomItems.map(i => ({ ...i, icon: null, isCustom: true, imageUrl: i.image }))
  ];

  const handleSelect = (label: string) => {
    setTypedText(typedText ? `${typedText} ${label}` : label);
    setPictureCategory(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    // UI update immediately (optimistic)
    removeCustomItem(id);

    try {
        await fetch(`/api/custom-icons?id=${id}`, { method: 'DELETE' });
    } catch (err) {
        console.error("Failed to delete", err);
        // Could revert here if needed, but for hackathon keeping simple
    }
  };

  return (
    <div className="w-full h-full relative">
       {/* Top Fade */}
       <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#E6E2D6] to-transparent z-10 pointer-events-none" />
       {/* Bottom Fade */}
       <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#E6E2D6] to-transparent z-10 pointer-events-none" />

      <div className="w-full h-full overflow-y-auto p-6 pt-8 pb-10 custom-scrollbar">
        <div className="mb-4 flex items-center gap-3 relative z-20">
          <button onClick={() => setPictureCategory(null)} className="text-sm font-bold text-clay-500 hover:text-clay-800 transition-colors px-2 py-1 rounded-lg hover:bg-clay-200/50">← Back</button>
          <h2 className="text-xl font-bold text-clay-900 capitalize">{category.replace('-', ' ')}</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {allItems.map((it) => (
          <button key={it.id} onClick={() => handleSelect(it.label)} className="group relative flex flex-col items-center justify-center gap-2 p-4 rounded-3xl bg-white/60 hover:bg-white/80 border border-white/60 hover:border-white shadow-sm hover:shadow-lg transition-all aspect-square backdrop-blur-md overflow-hidden">
            {it.isCustom && (
                <div 
                    onClick={(e) => handleDelete(e, it.id)}
                    className="absolute top-2 right-2 p-1.5 bg-crimson/10 text-crimson rounded-full hover:bg-crimson hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                    <Trash2 className="w-4 h-4" />
                </div>
            )}
            
            {it.isCustom && it.imageUrl ? (
               <img src={it.imageUrl} alt={it.label} className="w-16 h-16 object-contain rounded-xl" />
            ) : (
               it.icon && <it.icon className="w-12 h-12 text-crimson opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all mb-2" />
            )}
            <span className="text-sm text-clay-800 font-bold text-center leading-tight w-full px-2 break-words line-clamp-2">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
  );
}
