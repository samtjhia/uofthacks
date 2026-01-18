"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  { id: 'home', label: 'Home', icon: Home, color: 'text-emerald-500' },
  { id: 'play', label: 'Play', icon: Play, color: 'text-lime-500' },
];

const WORD_COLORS: Record<string, string> = {
  // Pronouns / People -> Yellow/Orange (Clay: Amber)
  'I': 'bg-amber-100/80 text-amber-900 border-amber-200/60', 
  'you': 'bg-amber-100/80 text-amber-900 border-amber-200/60', 
  'we': 'bg-amber-100/80 text-amber-900 border-amber-200/60', 
  'who': 'bg-amber-100/80 text-amber-900 border-amber-200/60', 
  'me': 'bg-amber-100/80 text-amber-900 border-amber-200/60',
  'us': 'bg-amber-100/80 text-amber-900 border-amber-200/60',

  // Verbs -> Pink (Clay: Rose)
  'is': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'can': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'will': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'do': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'have': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'want': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'like': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'need': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'get': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'play': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'help': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'stop': 'bg-rose-100/80 text-rose-900 border-rose-200/60', 
  
  // Questions -> Clay/Grey
  'what': 'bg-white/90 text-clay-900 border-clay-200',
  'where': 'bg-white/90 text-clay-900 border-clay-200',
  'when': 'bg-white/90 text-clay-900 border-clay-200',
  'why': 'bg-white/90 text-clay-900 border-clay-200',

  // Prepositions / Little words -> Lime
  'to': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'with': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'in': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'on': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'off': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'for': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'at': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'here': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'there': 'bg-lime-100/80 text-lime-900 border-lime-200/60',

  // Adjectives -> Blue (Clay: Azure)
  'good': 'bg-azure-100/80 text-azure-900 border-azure-200/60',
  'bad': 'bg-azure-100/80 text-azure-900 border-azure-200/60',
  'more': 'bg-azure-100/80 text-azure-900 border-azure-200/60', 
  'not': 'bg-azure-100/80 text-azure-900 border-azure-200/60', 

  // Time -> Azure
  'now': 'bg-azure-100/80 text-azure-900 border-azure-200/60', 
  'all done': 'bg-azure-100/80 text-azure-900 border-azure-200/60', 
  
  // New items from Rows 3-5
  'he': 'bg-amber-100/80 text-amber-900 border-amber-200/60',
  'she': 'bg-amber-100/80 text-amber-900 border-amber-200/60',
  'they': 'bg-amber-100/80 text-amber-900 border-amber-200/60',
  'it': 'bg-amber-100/80 text-amber-900 border-amber-200/60', 
  'this': 'bg-amber-100/80 text-amber-900 border-amber-200/60',
  'that': 'bg-amber-100/80 text-amber-900 border-amber-200/60',
  
  'go': 'bg-rose-100/80 text-rose-900 border-rose-200/60', 
  'come': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'take': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'see': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'look': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'put': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'make': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'think': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'know': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'say': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  'give': 'bg-rose-100/80 text-rose-900 border-rose-200/60',
  
  'out': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'of': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'up': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  'down': 'bg-lime-100/80 text-lime-900 border-lime-200/60',
  
  'different': 'bg-azure-100/80 text-azure-900 border-azure-200/60',
  'all': 'bg-azure-100/80 text-azure-900 border-azure-200/60',
  'some': 'bg-azure-100/80 text-azure-900 border-azure-200/60',

  'about': 'bg-white/80 text-clay-900 border-clay-200/60',
  'and': 'bg-white/80 text-clay-900 border-clay-200/60', 
  'because': 'bg-white/80 text-clay-900 border-clay-200/60',
  'but': 'bg-white/80 text-clay-900 border-clay-200/60', 
  
  'the': 'bg-orange-100/80 text-orange-900 border-orange-200/60',
  'a': 'bg-orange-100/80 text-orange-900 border-orange-200/60',

  // Quick / Common Items (Mixed categories)
  'yes': 'bg-emerald-100 text-emerald-900 border-emerald-200/60',
  'no': 'bg-rose-100 text-crimson border-rose-200/60',
  
  // Needs -> Purple/Indigo
  'hungry': 'bg-violet-100/80 text-violet-900 border-violet-200/60',
  'thirsty': 'bg-violet-100/80 text-violet-900 border-violet-200/60',
  'toilet': 'bg-violet-100/80 text-violet-900 border-violet-200/60',
  'sleep': 'bg-indigo-100/80 text-indigo-900 border-indigo-200/60',
  
  // Feelings -> Yellow/Blue
  'happy': 'bg-yellow-100/80 text-yellow-900 border-yellow-200/60',
  'sad': 'bg-indigo-100/80 text-indigo-900 border-indigo-200/60',
  
  // Places -> Green
  'home': 'bg-emerald-100/80 text-emerald-900 border-emerald-200/60',
  'school': 'bg-emerald-100/80 text-emerald-900 border-emerald-200/60',
  'park': 'bg-emerald-100/80 text-emerald-900 border-emerald-200/60',
  'store': 'bg-emerald-100/80 text-emerald-900 border-emerald-200/60',
};

// Helper: map a label to a color class string, defaulting to Clay-Light
function getTileColorClass(label: string, isFolder?: boolean): string {
  // If it's a folder, white background with subtle border
  if (isFolder) return 'bg-white border-clay-200/60 text-clay-900 border shadow-sm';

  // Direct match
  if (WORD_COLORS[label]) return WORD_COLORS[label];
  const lower = label.toLowerCase();
  
  if (WORD_COLORS[lower]) return WORD_COLORS[lower];

  // Default for normal items
  return 'bg-white/40 border-white/60 text-clay-900'
}

const MemoTile = React.memo(({ label, icon: Icon, color, onTileClick, isFolder, isDimmed, isRecommended }: { 
  label: string, 
  icon?: any, 
  color?: string, 
  onTileClick: (label: string, isFolder?: boolean) => void, 
  isFolder?: boolean,
  isDimmed?: boolean, 
  isRecommended?: boolean
}) => {
  const colorClass = getTileColorClass(label, isFolder);
  const hasColorBg = !colorClass.includes('bg-white/40');
  
  const iconClass = isFolder 
     ? (color ? color.replace('text-', 'text-') : 'text-clay-900') 
     : (hasColorBg ? 'text-black/70' : (color || 'text-clay-500'));

  return (
    <button 
      onClick={() => onTileClick(label, isFolder)}
      className={`
        group flex flex-col items-center justify-center text-center
        aspect-[9/10] w-full
        rounded-xl p-1.5 sm:p-2
        cursor-pointer
        border transition-all duration-300
        backdrop-blur-md overflow-hidden relative
        ${isDimmed ? 'opacity-40 scale-95 border-transparent shadow-none grayscale' : ''}
        ${isRecommended ? 'z-10 scale-105 shadow-[0_0_20px_rgba(235,52,52,0.3)] ring-2 ring-crimson/50 brightness-105' : ''}
        ${!isDimmed && !isRecommended ? 'hover:scale-[1.03] hover:brightness-105 hover:shadow-md hover:border-black/10' : ''}
        ${colorClass}
      `}
    >
      {Icon && (
        <Icon className={`w-7 h-7 sm:w-9 sm:h-9 mb-1 sm:mb-1.5 shrink-0 ${iconClass}`} />
      )}
      <div className="w-full flex items-center justify-center grow min-h-0 px-1">
         <span className="text-[10px] sm:text-xs font-bold leading-tight break-words hyphens-auto line-clamp-2 w-full uppercase tracking-tight opacity-90 block">
           {label}
         </span>
      </div>
    </button>
  );
});
MemoTile.displayName = 'Tile';

export default function PictureGrid({ onSelect }: PictureGridProps) {
  const { 
    pictureCategory, setPictureCategory, addCustomItem, setCustomItems, 
    isHighlightEnabled, suggestions, typedText, learnTransition 
  } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const typedTextRef = React.useRef(typedText);
  useEffect(() => { typedTextRef.current = typedText; }, [typedText]);

  useEffect(() => {
    const state = useStore.getState(); 
    if (state.inputMode !== 'spark' && typedText.trim().length > 0) {
        state.refreshPredictions(typedText); 
    }
  }, [typedText]);

  useEffect(() => {
    const fetchIcons = async () => {
        try {
            const res = await fetch('/api/custom-icons');
            const data = await res.json();
            if (data.icons) {
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
  }, []); 

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

  const recommendedSet = React.useMemo(() => {
    if (!suggestions.length || typedText.trim().length === 0) return new Set<string>();
    
    const recs = new Set<string>();
    const loweredSuggestions = suggestions.map(s => s.label.toLowerCase());

    const checkAndAdd = (label: string) => {
        const lbl = label.toLowerCase();
        const isMatch = loweredSuggestions.some(sug => {
            if (sug === lbl || sug.startsWith(lbl)) return true;
            return sug.includes(` ${lbl} `) || sug.endsWith(` ${lbl}`) || sug.startsWith(`${lbl} `);
        });
        if (isMatch) recs.add(label);
    };

    FIRST_ROW.forEach(checkAndAdd);
    SECOND_ROW.forEach(checkAndAdd);
    THIRD_ROW.forEach(checkAndAdd);
    FOURTH_ROW.forEach(checkAndAdd);
    FIFTH_ROW.forEach(checkAndAdd);
    remainingQuick.forEach(q => checkAndAdd(q.label));
    CATEGORIES.forEach(c => checkAndAdd(c.label));
    
    return recs;
  }, [suggestions, typedText, remainingQuick]);

  const handleTileClick = React.useCallback((label: string, isFolder?: boolean) => {
    if (label === "Add Word") {
        setIsModalOpen(true);
        return;
    }
    if (isFolder) {
        const cat = CATEGORIES.find(c => c.label === label);
        if (cat) setPictureCategory(cat.id);
    } else {
        onSelect(label);
    }
  }, [onSelect, setPictureCategory, setIsModalOpen, learnTransition]);

  const renderTile = React.useCallback((label: string, icon: any, color?: string, isFolder: boolean = false) => {
    const isRecommended = isHighlightEnabled && recommendedSet.has(label);
    const hasSuggestions = suggestions.length > 0 && typedText.trim().length > 0;
    const isDimmed = isHighlightEnabled && hasSuggestions && !isRecommended;

    return (
      <MemoTile
        key={label}
        label={label}
        icon={icon}
        color={color}
        onTileClick={handleTileClick}
        isFolder={isFolder}
        isDimmed={isDimmed} 
        isRecommended={isRecommended}
      />
    );
  }, [recommendedSet, isHighlightEnabled, suggestions.length, typedText.length, handleTileClick]);

  if (pictureCategory) {
    return <CategoryGrid category={pictureCategory} />;
  }

  return (
    <div className="w-full h-full relative group/grid">
      {/* Top Fade */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#E6E2D6] to-transparent z-10 pointer-events-none" />

      <div className="w-full h-full overflow-y-auto px-4 pt-8 pb-8 custom-scrollbar flex flex-col gap-2 relative">
        
        {/* Top fixed rows */}
        <div className="grid grid-cols-11 gap-2">
          {FIRST_ROW.map((label) => renderTile(label, WORD_ICONS[label]))}
        </div>

      <div className="grid grid-cols-11 gap-2">
        {SECOND_ROW.map((label) => renderTile(label, WORD_ICONS[label]))}
      </div>

      <div className="grid grid-cols-11 gap-2">
        {THIRD_ROW.map((label) => renderTile(label, WORD_ICONS[label]))}
      </div>

      <div className="grid grid-cols-11 gap-2">
        {FOURTH_ROW.map((label) => renderTile(label, WORD_ICONS[label]))}
      </div>

      <div className="grid grid-cols-11 gap-2">
        {FIFTH_ROW.map((label) => renderTile(label, WORD_ICONS[label]))}
      </div>

      {/* Remaining quick items */}
      <div className="grid grid-cols-11 gap-2">
        {remainingQuick.map((item) => renderTile(item.label, item.icon, item.color))}
      </div>

      {/* Categories (folders) at the very end */}
      <div className="grid grid-cols-11 gap-2">
        {CATEGORIES.map((cat) => renderTile(cat.label, cat.icon, cat.color, true))}
        
        {/* Spacer to push Add Word to the corner (11th col) */}
        <div className="w-full aspect-square" />
        <button 
           onClick={() => setIsModalOpen(true)}
           className="group flex flex-col items-center justify-center text-center aspect-[9/10] w-full rounded-xl p-2 cursor-pointer border-2 border-dashed border-clay-400/60 bg-white/50 text-clay-600 hover:text-crimson hover:border-crimson hover:bg-white transition-all backdrop-blur-sm"
        >
           <Plus className="w-8 h-8 mb-1 opacity-80 group-hover:opacity-100" />
           <span className="text-xs font-bold leading-tight uppercase">Add Word</span>
        </button>
      </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#E6E2D6] to-transparent z-10 pointer-events-none" />

      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-clay-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/90 border border-white/60 p-6 rounded-[2rem] w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.1)] backdrop-blur-xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-clay-900 mb-1">Infinite Icon</h3>
            <p className="text-clay-500 text-sm mb-4">Generate a new word with AI.</p>
            
            <input 
              autoFocus
              className="w-full bg-clay-100/50 text-clay-900 placeholder-clay-400 rounded-2xl px-4 py-3 mb-4 focus:ring-2 focus:ring-crimson/50 outline-none border border-clay-200 transition-all"
              placeholder="Type a word (e.g. Banana)"
              value={newWord}
              onChange={(e) => {
                const val = e.target.value;
                const formatted = val.split(' ').map(word => 
                    word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                ).join(' ');
                setNewWord(formatted);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWord()}
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isGenerating}
                className="flex-1 px-4 py-3 rounded-2xl bg-clay-100 text-clay-500 font-bold hover:bg-clay-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateWord}
                disabled={isGenerating || !newWord.trim()}
                className="flex-1 px-4 py-3 rounded-2xl bg-crimson text-white font-bold hover:bg-crimson/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-crimson/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Icon</span>
                )}
              </button>
            </div>
            {isGenerating && (
                <p className="text-center text-xs text-clay-500 mt-3 animate-pulse font-medium">Dreaming up a symbol...</p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
