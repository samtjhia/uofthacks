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
  return 'bg-white/40 backdrop-blur-md border-white/60 text-clay-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/60 hover:border-white'
}

const MemoTile = React.memo(({ label, icon: Icon, color, onTileClick, isFolder, isDimmed, isRecommended }: { 
  label: string, 
  icon?: any, 
  color?: string, 
  onTileClick: (label: string, isFolder?: boolean) => void, 
  isFolder?: boolean,
  isDimmed?: boolean, // This means "visually deemphasized"
  isRecommended?: boolean
}) => {
  // Determine background/border/text style
  const colorClass = getTileColorClass(label, isFolder);
  
  // Check if we are using a specific colored background (not white)
  const hasColorBg = !colorClass.includes('bg-white');
  
  // For folders (white bg), we want colored icons. For other colored tiles, we generally want dark icons.
  // Use the passed `color` prop if available (for folders), otherwise dark if bg is light, otherwise light.
  const iconClass = isFolder 
     ? (color ? color.replace('text-', 'text-') : 'text-clay-900') // Keep original color for folders 
     : (hasColorBg ? 'text-slate-900 opacity-80' : (color || 'text-clay-400'));

  return (
    <button 
      onClick={() => onTileClick(label, isFolder)}
      className={`
        group relative flex flex-col items-center justify-center text-center overflow-hidden
        aspect-square w-full
        rounded-[1.5rem] p-3
        cursor-pointer
        border transition-all duration-300
        ${isDimmed ? 'opacity-40 scale-95 border-transparent shadow-none grayscale hover:filter-none hover:opacity-100 hover:scale-100 hover:z-20' : ''}
        ${isRecommended ? 'z-10 scale-105 shadow-[0_0_30px_rgba(220,38,38,0.25)] ring-4 ring-crimson/40 brightness-105' : ''}
        ${!isDimmed && !isRecommended ? 'hover:scale-105 hover:shadow-xl hover:-translate-y-1' : ''}
        ${colorClass}
        ${hasColorBg ? 'bg-opacity-90 backdrop-blur-sm shadow-lg shadow-clay-500/10' : ''}
      `}
    >
      {/* Glass Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {Icon && (
        <Icon className={`w-8 h-8 mb-2 relative z-10 drop-shadow-sm ${iconClass}`} />
      )}
      <span className="text-xs sm:text-sm font-bold leading-tight break-words line-clamp-2 relative z-10 drop-shadow-sm">
        {label}
      </span>
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
  
  // Ref for typedText to prevent re-creating handleTileClick on every keystroke
  const typedTextRef = React.useRef(typedText);
  useEffect(() => { typedTextRef.current = typedText; }, [typedText]);

  // TRIGGER PREDICTIONS ON TYPING (The Missing Link for Signal Brain)
  // When text changes, we want to refresh predictions so the grid highlights update based on the new context
  useEffect(() => {
    // Only fetch if meaningful change and we are not in infinite loop
    const state = useStore.getState(); // Get fresh state
    if (state.inputMode !== 'spark' && typedText.trim().length > 0) {
        state.refreshPredictions(typedText); // This debounces internally in store if called rapidly
    }
  }, [typedText]);

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

  // Optimization: Calculate recommendations once per store update
  const recommendedSet = React.useMemo(() => {
    // FIX: Optimized calculation - only runs when typedText or suggestions change
    if (!suggestions.length || typedText.trim().length === 0) return new Set<string>();
    
    const recs = new Set<string>();
    const loweredSuggestions = suggestions.map(s => s.label.toLowerCase());

    const checkAndAdd = (label: string) => {
        const lbl = label.toLowerCase();
        // Check exact match or if it's part of the suggestion phrase
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
        // --- LEARNING REMOVED (Moved to 'Speak' action) ---
        // We only learn when the user commits to the full sentence.
        /*
        const currentBuffer = typedTextRef.current.trim();
        if (currentBuffer.length > 0) {
            const words = currentBuffer.split(/\s+/);
            const contextWord = words[words.length - 1]; 
            if (learnTransition) {
                 learnTransition(contextWord, label);
            }
        }
        */
        
        onSelect(label);
    }
  }, [onSelect, setPictureCategory, setIsModalOpen, learnTransition]);

  const renderTile = React.useCallback((label: string, icon: any, color?: string, isFolder: boolean = false) => {
    // Basic booleans
    // FIX: Only show recommendations if Highlight is enabled
    const isRecommended = isHighlightEnabled && recommendedSet.has(label);
    
    // Since we moved this hook up, we must ensure these variables are accessible or re-access from store
    // actually 'suggestions' and 'typedText' are in scope from useStore
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
        isDimmed={isDimmed} // Just semantic
        isRecommended={isRecommended}
      />
    );
  }, [recommendedSet, isHighlightEnabled, suggestions.length, typedText.length, handleTileClick]);

  if (pictureCategory) {
    return <CategoryGrid category={pictureCategory} />;
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2 relative">
      
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
           className="group flex flex-col items-center justify-center text-center aspect-square w-full rounded-2xl p-2 cursor-pointer border border-dashed border-slate-600 bg-slate-800/40 text-slate-400 hover:text-white hover:border-sky-500 hover:bg-slate-800 transition-all"
        >
           <Plus className="w-8 h-8 mb-1 opacity-60 group-hover:opacity-100" />
           <span className="text-xs font-bold leading-tight">Add Word</span>
        </button>
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
              onChange={(e) => {
                const val = e.target.value;
                // Title Case each word (e.g. "red apple" -> "Red Apple")
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
                  <span>Create Icon</span>
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
