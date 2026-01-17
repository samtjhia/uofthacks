"use client";
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import CategoryGrid from './CategoryGrid';
import { 
  Apple, Coffee, Utensils, Home, Smile, CheckCircle, XCircle, Play, Plus, Bath, Moon,
  ArrowRight, Heart, ThumbsUp, AlertCircle, Download, Box, Clock, CheckCheck, HelpCircle, MapPin, Briefcase, Ban,
  Eye, Hand, Footprints, MessageSquare, LogIn, LogOut, ArrowUp, ArrowDown, ChevronRight, Hash, Star, Sun, ShieldQuestion, ThumbsDown, Loader2
} from 'lucide-react';
import {
  User,
  Users,
} from 'lucide-react';

interface PictureGridProps { onSelect: (label: string) => void }

const WORD_ICONS: Record<string, any> = {
  'I': User,
  'is': CheckCircle,
  'can': CheckCircle,
  'will': ArrowRight,
  'do': Play,
  'have': Briefcase,
  'what': HelpCircle,
  'where': MapPin,
  'who': User,
  'not': Ban,
  'more': Plus,
  'you': User,
  'we': Users,
  'want': Heart,
  'like': ThumbsUp,
  'need': AlertCircle,
  'get': Download,
  'to': ArrowRight,
  'with': Users,
  'in': Box,
  'now': Clock,
  'all done': CheckCheck,
  'he': User,
  'she': User,
  'they': Users,
  'it': Box,
  'this': ArrowRight,
  'that': ArrowRight,
  'stop': Ban,
  'go': ArrowRight,
  'come': LogIn,
  'take': Hand,
  'see': Eye,
  'look': Eye,
  'think': Smile,
  'know': Smile,
  'say': MessageSquare,
  'give': Hand,
  'put': Box,
  'make': Star,
  'for': ArrowRight,
  'here': MapPin,
  'there': MapPin,
  'out': LogOut,
  'of': Box,
  'up': ArrowUp,
  'down': ArrowDown,
  'on': ArrowDown,
  'off': Ban,
  'good': ThumbsUp,
  'bad': ThumbsDown,
  'different': Star,
  'all': CheckCheck,
  'some': Hash,
  'and': Plus,
  'because': ShieldQuestion,
  'but': ChevronRight,
  'the': Star,
  'a': Star,
};

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: Apple, color: 'text-amber-400' , route: '/pictures/food'},
  { id: 'drinks', label: 'Drinks', icon: Coffee, color: 'text-sky-400' , route: '/pictures/drinks'},
  { id: 'activities', label: 'Activities', icon: Play, color: 'text-lime-400' , route: '/pictures/activities'},
  { id: 'people', label: 'People', icon: Plus, color: 'text-blue-400' , route: '/pictures/people'},
  { id: 'feelings', label: 'Feelings', icon: Smile, color: 'text-yellow-400' , route: '/pictures/feelings'},
  { id: 'needs', label: 'Needs', icon: Utensils, color: 'text-orange-400' , route: '/pictures/needs'},
  { id: 'places', label: 'Places', icon: Home, color: 'text-emerald-400' , route: '/pictures/places'},
    { id: 'actions', label: 'Actions', icon: Plus, color: 'text-slate-300' , route: '/pictures/actions'},
    { id: 'pronouns', label: 'Pronouns', icon: User, color: 'text-indigo-400' , route: '/pictures/pronouns'},
];

const QUICK = [
  { id: 'yes', label: 'Yes', icon: CheckCircle, color: 'text-emerald-400' },
  { id: 'no', label: 'No', icon: XCircle, color: 'text-rose-500' },
  { id: 'help', label: 'Help', icon: CheckCircle, color: 'text-red-500' },
  { id: 'hungry', label: 'Hungry', icon: Utensils, color: 'text-orange-400' },
  { id: 'thirsty', label: 'Thirsty', icon: Coffee, color: 'text-sky-400' },
  { id: 'toilet', label: 'Toilet', icon: Bath, color: 'text-cyan-400' },
  { id: 'happy', label: 'Happy', icon: Smile, color: 'text-yellow-400' },
  { id: 'sad', label: 'Sad', icon: Moon, color: 'text-indigo-300' },
  { id: 'home', label: 'Home', icon: Home, color: 'text-emerald-400' },
  { id: 'play', label: 'Play', icon: Play, color: 'text-lime-400' },
];

const WORD_COLORS: Record<string, string> = {
  // Pronouns / People -> Yellow/Orange
  'I': 'bg-amber-400 text-slate-900 border-amber-500', 
  'you': 'bg-amber-400 text-slate-900 border-amber-500', 
  'we': 'bg-amber-400 text-slate-900 border-amber-500', 
  'who': 'bg-amber-400 text-slate-900 border-amber-500', // Sometimes considered pronoun or question.
  'me': 'bg-amber-400 text-slate-900 border-amber-500',
  'us': 'bg-amber-400 text-slate-900 border-amber-500',

  // Verbs -> Pink
  'is': 'bg-pink-400 text-slate-900 border-pink-500',
  'can': 'bg-pink-400 text-slate-900 border-pink-500',
  'will': 'bg-pink-400 text-slate-900 border-pink-500',
  'do': 'bg-pink-400 text-slate-900 border-pink-500',
  'have': 'bg-pink-400 text-slate-900 border-pink-500',
  'want': 'bg-pink-400 text-slate-900 border-pink-500',
  'like': 'bg-pink-400 text-slate-900 border-pink-500',
  'need': 'bg-pink-400 text-slate-900 border-pink-500',
  'get': 'bg-pink-400 text-slate-900 border-pink-500',
  'play': 'bg-pink-400 text-slate-900 border-pink-500',
  'help': 'bg-pink-400 text-slate-900 border-pink-500',
  'stop': 'bg-pink-400 text-slate-900 border-pink-500', // Often red/stop sign... overriding to pink as requested
  
  // Questions -> White/Grey or dedicated
  'what': 'bg-slate-200 text-slate-900 border-slate-300',
  'where': 'bg-slate-200 text-slate-900 border-slate-300',
  'when': 'bg-slate-200 text-slate-900 border-slate-300',
  'why': 'bg-slate-200 text-slate-900 border-slate-300',

  // Prepositions / Little words -> Green
  'to': 'bg-lime-400 text-slate-900 border-lime-500',
  'with': 'bg-lime-400 text-slate-900 border-lime-500',
  'in': 'bg-lime-400 text-slate-900 border-lime-500',
  'on': 'bg-lime-400 text-slate-900 border-lime-500',
  'off': 'bg-lime-400 text-slate-900 border-lime-500',
  'for': 'bg-lime-400 text-slate-900 border-lime-500',
  'at': 'bg-lime-400 text-slate-900 border-lime-500',
  'here': 'bg-lime-400 text-slate-900 border-lime-500',
  'there': 'bg-lime-400 text-slate-900 border-lime-500',

  // Adjectives -> Blue
  'good': 'bg-sky-400 text-slate-900 border-sky-500',
  'bad': 'bg-sky-400 text-slate-900 border-sky-500',
  'more': 'bg-sky-400 text-slate-900 border-sky-500', // same as good
  'not': 'bg-sky-400 text-slate-900 border-sky-500', // same as good

  // Time -> Brown/Orange/Blue
  'now': 'bg-sky-400 text-slate-900 border-sky-500', // same as good
  'all done': 'bg-sky-400 text-slate-900 border-sky-500', // same as good
  
  // New items from Rows 3-5
  'he': 'bg-amber-400 text-slate-900 border-amber-500',
  'she': 'bg-amber-400 text-slate-900 border-amber-500',
  'they': 'bg-amber-400 text-slate-900 border-amber-500',
  'it': 'bg-amber-400 text-slate-900 border-amber-500', // yellow in AAC
  'this': 'bg-amber-400 text-slate-900 border-amber-500',
  'that': 'bg-amber-400 text-slate-900 border-amber-500',
  
  'go': 'bg-pink-400 text-slate-900 border-pink-500', // same as is
  'come': 'bg-pink-400 text-slate-900 border-pink-500',
  'take': 'bg-pink-400 text-slate-900 border-pink-500',
  'see': 'bg-pink-400 text-slate-900 border-pink-500',
  'look': 'bg-pink-400 text-slate-900 border-pink-500',
  'put': 'bg-pink-400 text-slate-900 border-pink-500',
  'make': 'bg-pink-400 text-slate-900 border-pink-500',
  'think': 'bg-pink-400 text-slate-900 border-pink-500',
  'know': 'bg-pink-400 text-slate-900 border-pink-500',
  'say': 'bg-pink-400 text-slate-900 border-pink-500',
  'give': 'bg-pink-400 text-slate-900 border-pink-500',
  
  'out': 'bg-lime-400 text-slate-900 border-lime-500',
  'of': 'bg-lime-400 text-slate-900 border-lime-500',
  'up': 'bg-lime-400 text-slate-900 border-lime-500',
  'down': 'bg-lime-400 text-slate-900 border-lime-500',
  
  'different': 'bg-sky-400 text-slate-900 border-sky-500',
  'all': 'bg-sky-400 text-slate-900 border-sky-500',
  'some': 'bg-sky-400 text-slate-900 border-sky-500',

  'about': 'bg-white text-slate-900 border-slate-300',
  'and': 'bg-white text-slate-900 border-slate-300', // often conjunctions are white/grey
  'because': 'bg-white text-slate-900 border-slate-300',
  'but': 'bg-white text-slate-900 border-slate-300', 
  
  'the': 'bg-orange-400 text-slate-900 border-orange-500',
  'a': 'bg-orange-400 text-slate-900 border-orange-500',

  // Quick / Common Items (Mixed categories)
  'yes': 'bg-emerald-400 text-slate-900 border-emerald-500',
  'no': 'bg-rose-400 text-slate-900 border-rose-500',
  
  // Needs -> Orange/Yellow range
  'hungry': 'bg-violet-400 text-slate-900 border-violet-500',
  'thirsty': 'bg-violet-400 text-slate-900 border-violet-500',
  'toilet': 'bg-violet-400 text-slate-900 border-violet-500',
  'sleep': 'bg-indigo-200 text-slate-900 border-indigo-300',
  
  // Feelings -> Yellow/Blue
  'happy': 'bg-yellow-300 text-slate-900 border-yellow-400',
  'sad': 'bg-indigo-300 text-slate-900 border-indigo-400',
  
  // Places -> Green
  'home': 'bg-emerald-300 text-slate-900 border-emerald-400',
  'school': 'bg-emerald-300 text-slate-900 border-emerald-400',
  'park': 'bg-emerald-300 text-slate-900 border-emerald-400',
  'store': 'bg-emerald-300 text-slate-900 border-emerald-400',
};

// Helper: map a label to a color class string, defaulting to dark slate 
function getTileColorClass(label: string, isFolder?: boolean): string {
  // If it's a folder, use light gray background (folder differentiation)
  if (isFolder) return 'bg-slate-200 border-slate-300 text-slate-900 border-b-4 border-b-slate-400';

  // Direct match
  if (WORD_COLORS[label]) return WORD_COLORS[label];
  // Lowercase match
  const lower = label.toLowerCase();
  
  if (WORD_COLORS[lower]) return WORD_COLORS[lower];

  // Default for normal items
  return 'bg-slate-800 border-slate-700/50 text-slate-200'
}

export default function PictureGrid({ onSelect }: PictureGridProps) {
  const { pictureCategory, setPictureCategory, addCustomItem, setCustomItems } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load custom icons from DB on mount
  useEffect(() => {
    const fetchIcons = async () => {
        try {
            const res = await fetch('/api/custom-icons');
            const data = await res.json();
            if (data.icons) {
                // Completely replace the store with the source of truth from DB
                // This prevents duplicates on reloads/hmr/strict mode
                const mappedIcons = data.icons.map((icon: any) => ({
                    id: icon._id,
                    label: icon.label,
                    category: icon.category,
                    image: icon.imageUrl
                }));
                setCustomItems(mappedIcons);
            }
        } catch (e) {
            console.error("Failed to load icons", e);
        }
    };
    fetchIcons();
  }, []); // Run once on mount

  const handleCreateWord = async () => {
    if (!newWord.trim()) return;
    setIsGenerating(true);
    try {
      // 1. Categorize
      const catRes = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          word: newWord, 
          categories: CATEGORIES.map(c => c.id) 
        })
      });
      const catData = await catRes.json();
      const category = catData.category ? catData.category.toLowerCase() : 'actions';

      // 2. Generate Icon
      const imgRes = await fetch('/api/generate-icon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord })
      });
      const imgData = await imgRes.json();
      
      if (imgData.imageUrl) {
         // 3. Save to DB
         const saveRes = await fetch('/api/custom-icons', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 label: newWord,
                 category: category,
                 imageUrl: imgData.imageUrl
             })
         });
         const savedData = await saveRes.json();
         const savedId = savedData.icon?._id || Date.now().toString();

         addCustomItem({
            id: savedId,
            label: newWord,
            category: category,
            image: imgData.imageUrl
         });
      }
      setIsModalOpen(false);
      setNewWord('');
    } catch (e) {
      console.error("Failed to create word", e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (pictureCategory) {
    return <CategoryGrid category={pictureCategory} />;
  }
  
  // Desired fixed rows and ordering
  const FIRST_ROW = ['I','is','can','will','do','have','what','where','who','not','more'];
  const SECOND_ROW = ['you','we','want','like','need','get','to','with','in','now','all done'];
  const THIRD_ROW = ['he','she','stop','go','come','take','for','here','out','good','different'];
  const FOURTH_ROW = ['it','this','see','look','put','make','of','there','up','bad','all'];
  const FIFTH_ROW = ['they','that','think','know','say','give','on','off','down','and','some'];

  const loweredFirst = new Set(FIRST_ROW.map(s => s.toLowerCase()));
  const loweredSecond = new Set(SECOND_ROW.map(s => s.toLowerCase()));
  const loweredThird = new Set(THIRD_ROW.map(s => s.toLowerCase()));
  const loweredFourth = new Set(FOURTH_ROW.map(s => s.toLowerCase()));
  const loweredFifth = new Set(FIFTH_ROW.map(s => s.toLowerCase()));

  const remainingQuick = QUICK.filter(q => 
    !loweredFirst.has(q.label.toLowerCase()) && 
    !loweredSecond.has(q.label.toLowerCase()) &&
    !loweredThird.has(q.label.toLowerCase()) &&
    !loweredFourth.has(q.label.toLowerCase()) &&
    !loweredFifth.has(q.label.toLowerCase())
  );

  const Tile = ({ label, icon: Icon, color, onClick, isFolder }: { label: string, icon?: any, color?: string, onClick: () => void, isFolder?: boolean }) => {
    // Determine background/border/text style
    const colorClass = getTileColorClass(label, isFolder);
    
    // Check if we are using a specific colored background (not the default slate-800)
    const hasColorBg = !colorClass.includes('bg-slate-800');
    
    // For folders (white bg), we want colored icons. For other colored tiles, we generally want dark icons.
    // Use the passed `color` prop if available (for folders), otherwise dark if bg is light, otherwise light.
    const iconClass = isFolder 
       ? (color ? color.replace('text-', 'text-') : 'text-slate-900') // Keep original color for folders 
       : (hasColorBg ? 'text-slate-900 opacity-80' : (color || 'text-slate-300'));

    return (
    <button 
      onClick={onClick}
      className={`
        group flex flex-col items-center justify-center text-center
        aspect-square w-full
        rounded-2xl p-2
        border hover:brightness-110 hover:scale-105 transition-all shadow-sm
        ${colorClass} // Apply the determined background/text colors
      `}
    >
      {Icon && (
        <Icon className={`w-8 h-8 mb-1 ${iconClass}`} />
      )}
      <span className="text-xs sm:text-sm font-bold leading-tight break-words line-clamp-2">
        {label}
      </span>
    </button>
  );
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2">
      {/* Top fixed rows */}
      <div className="grid grid-cols-11 gap-2">
        {FIRST_ROW.map((label) => (
          <Tile key={label} label={label} icon={WORD_ICONS[label]} onClick={() => onSelect(label)} />
        ))}
      </div>

      <div className="grid grid-cols-11 gap-2">
        {SECOND_ROW.map((label) => (
          <Tile key={label} label={label} icon={WORD_ICONS[label]} onClick={() => onSelect(label)} />
        ))}
      </div>

      <div className="grid grid-cols-11 gap-2">
        {THIRD_ROW.map((label) => (
          <Tile key={label} label={label} icon={WORD_ICONS[label]} onClick={() => onSelect(label)} />
        ))}
      </div>

      <div className="grid grid-cols-11 gap-2">
        {FOURTH_ROW.map((label) => (
          <Tile key={label} label={label} icon={WORD_ICONS[label]} onClick={() => onSelect(label)} />
        ))}
      </div>

      <div className="grid grid-cols-11 gap-2">
        {FIFTH_ROW.map((label) => (
          <Tile key={label} label={label} icon={WORD_ICONS[label]} onClick={() => onSelect(label)} />
        ))}
      </div>

      {/* Remaining quick items */}
      <div className="grid grid-cols-11 gap-2">
        {remainingQuick.map((item) => (
          <Tile 
            key={item.id} 
            label={item.label} 
            icon={item.icon} 
            color={item.color} 
            onClick={() => onSelect(item.label)} 
          />
        ))}
      </div>

      {/* Categories (folders) at the very end */}
      <div className="grid grid-cols-11 gap-2">
        {CATEGORIES.map((cat) => (
          <Tile 
            key={cat.id} 
            label={cat.label} 
            icon={cat.icon} 
            color={cat.color} 
            isFolder
            onClick={() => setPictureCategory(cat.id)} 
          />
        ))}
        <Tile 
          label="Add Word" 
          icon={Plus} 
          isFolder 
          color="text-slate-500" 
          onClick={() => setIsModalOpen(true)} 
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Infinite Icon</h3>
            <p className="text-slate-400 text-sm mb-4">Generate a new word with AI.</p>
            
            <input 
              autoFocus
              className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-sky-500 outline-none border border-slate-700"
              placeholder="Type a word (e.g. Banana)"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWord()}
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isGenerating}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateWord}
                disabled={isGenerating || !newWord.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-sky-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Magic</span>
                )}
              </button>
            </div>
            {isGenerating && (
                <p className="text-center text-xs text-slate-500 mt-3 animate-pulse">This may take a few seconds...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
