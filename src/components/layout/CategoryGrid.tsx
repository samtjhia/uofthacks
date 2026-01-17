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
    <div className="w-full h-full p-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => setPictureCategory(null)} className="text-sm text-slate-400 hover:text-white">Back</button>
        <h2 className="text-lg font-bold text-slate-200 capitalize">{category.replace('-', ' ')}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {allItems.map((it) => (
          <button key={it.id} onClick={() => handleSelect(it.label)} className="group relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 aspect-square">
            {it.isCustom && (
                <div 
                    onClick={(e) => handleDelete(e, it.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                    <Trash2 className="w-4 h-4" />
                </div>
            )}
            
            {it.isCustom && it.imageUrl ? (
               <img src={it.imageUrl} alt={it.label} className="w-12 h-12 object-contain rounded-md" />
            ) : (
               it.icon && <it.icon className="w-10 h-10 text-sky-400" />
            )}
            <span className="text-sm text-slate-200 font-semibold text-center">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
