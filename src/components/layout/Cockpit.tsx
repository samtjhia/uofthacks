"use client";
import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { SuggestionResponse } from '@/types';
import { Activity, Volume2, X, Delete, Plus, Check } from 'lucide-react';
import VirtualKeyboard from './VirtualKeyboard';
import PictureGrid from './PictureGrid';
import SchedulerView from './SchedulerView';
import WaveformVisualizer from '../ui/WaveformVisualizer';
import { TimePicker } from './TimePicker';
import { speakText } from '@/lib/elevenlabs';

export default function Cockpit() {
  const { 
    isListening, inputMode, setInputMode, typedText, setTypedText, isPredicting, suggestions, 
    addHistoryItem, reinforceHabit, schedulerAddingToBlock, setSchedulerAddingToBlock, addScheduleItem,
    isHighlightEnabled, toggleHighlight 
  } = useStore();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pendingLabel, setPendingLabel] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a real input (if we had any) or modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const state = useStore.getState();
      const currentText = state.typedText;

      // Auto-switch to text mode on typing if in spark mode
      if (state.inputMode === 'spark' && (e.key.length === 1 || e.key === 'Backspace')) {
        state.setInputMode('text');
      }

      if (e.key === 'Backspace') {
        state.setTypedText(currentText.slice(0, -1));
      } else if (e.key === 'Escape') {
        state.setTypedText('');
      } else if (e.key.length === 1) {
        state.setTypedText(currentText + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyPress = (key: string) => {
    if (key === 'DEL') {
      setTypedText(typedText.slice(0, -1));
    } else if (key === 'SPACE') {
      setTypedText(typedText + ' ');
    } else {
      // Force lowercase
      setTypedText(typedText + key.toLowerCase());
    }
  };

  const handlePictureSelect = (label: string) => {
    setTypedText(typedText ? `${typedText} ${label}` : label);
  };
  
  const handleSpeak = async () => {
    if (!typedText) return;

    if (schedulerAddingToBlock) {
      // Instead of adding immediately, open Time Picker
      setPendingLabel(typedText);
      setShowTimePicker(true);
      return;
    }

    console.log('Speaking:', typedText);
    const ok = await speakText(typedText);
    if (ok) {
      reinforceHabit(typedText);
      addHistoryItem({
        id: Date.now().toString(),
        role: 'user',
        content: typedText,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('TTS failed');
    }
  };

  const handleTimeConfirm = async (time: string, duration: number) => {
    if (schedulerAddingToBlock && pendingLabel) {
      await addScheduleItem(pendingLabel, schedulerAddingToBlock, time, duration);
      setTypedText('');
      setPendingLabel('');
      setSchedulerAddingToBlock(null);
      setShowTimePicker(false);
    }
  };

  const getInitialTimeForBlock = () => {
    switch (schedulerAddingToBlock) {
      case 'morning': return '08:00';
      case 'afternoon': return '12:00';
      case 'evening': return '18:00';
      default: return '12:00';
    }
  };

  const handleClear = () => {
    if (schedulerAddingToBlock) {
      setSchedulerAddingToBlock(null);
      setTypedText('');
      return;
    }
    setTypedText('');
  };

  const handleBackspace = () => {
    // Delete last word logic
    if (!typedText) return;
    const trimmed = typedText.trimEnd();
    const lastSpace = trimmed.lastIndexOf(' ');
    
    // If no space found, delete everything (it's one word)
    if (lastSpace === -1) {
       setTypedText('');
    } else {
       // Keep everything up to the last space
       setTypedText(trimmed.substring(0, lastSpace));
    }
  };

  const DEFAULTS: SuggestionResponse[] = [
    { id: 'd1', label: 'Yes', text: 'Yes', type: 'prediction' },
    { id: 'd2', label: 'No', text: 'No', type: 'prediction' },
    { id: 'd3', label: 'Hi', text: 'Hi', type: 'prediction' },
    { id: 'd4', label: 'Thanks', text: 'Thanks', type: 'prediction' }
  ];

  // Logic update: Trust the store's suggestions (which now come from Grammar and Gemini).
  // CRITICAL: User requirement - If input is empty (or just whitespace), ALWAYS show defaults in bubbles.
  const wordSuggestions = (!typedText || typedText.trim() === '')
    ? DEFAULTS
    : suggestions.slice(0, 4);

  return (
    <div className="flex-1 h-full flex flex-col font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between gap-4">
        {/* Visualizer / Status */}
        <div className="flex-1 h-12 rounded-[1.2rem] bg-white/40 backdrop-blur-sm overflow-hidden relative border border-white/60 shadow-sm">
            <WaveformVisualizer isActive={isListening} />
            {!isListening && (
                <div className="absolute inset-0 flex items-center justify-center text-clay-500 gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ready</span>
                </div>
            )}
        </div>

        {/* MODE TOGGLES */}
        <div className="h-12 bg-white/40 p-1 rounded-[1.2rem] flex items-center shrink-0 border border-white/60 backdrop-blur-sm shadow-sm">
            {(['text', 'picture', 'spark', 'schedule'] as const).map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`px-4 h-full rounded-[0.9rem] text-xs font-bold transition-all duration-300 capitalize ${
                    inputMode === mode 
                    ? 'bg-white text-clay-900 shadow-sm ring-1 ring-black/5 scale-[1.02]' 
                    : 'text-clay-500 hover:text-clay-800 hover:bg-white/30'
                  }`}
                >
                  {mode}
                </button>
            ))}
        </div>

        {/* AI ASSIST TOGGLE (Only in Picture Mode) */}
        {inputMode === 'picture' && (
             <button 
               onClick={toggleHighlight}
               className={`ml-3 h-12 flex items-center gap-3 px-4 rounded-[1.2rem] border transition-all duration-300 ${
                 isHighlightEnabled 
                 ? 'bg-crimson/5 border-crimson/20' 
                 : 'bg-white/40 border-white/60 hover:bg-white/60'
               }`}
             >
                <div className="flex flex-col items-start gap-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${isHighlightEnabled ? 'text-crimson' : 'text-clay-400'}`}>
                        AI Assist
                    </span>
                    <span className="text-[10px] opacity-60 leading-none text-clay-400">
                        {isHighlightEnabled ? 'Active' : 'Off'}
                    </span>
                </div>
                
                {/* Switch Graphic */}
                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                    isHighlightEnabled ? 'bg-crimson' : 'bg-clay-300'
                }`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${
                        isHighlightEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </div>
             </button>
        )}
      </div>

      {/* MIDDLE ROW (Input) */}
      {(inputMode !== 'schedule' || schedulerAddingToBlock) && (
      <div className="shrink-0 px-6 pb-4 flex items-stretch gap-3">
        {/* INPUT BAR + CLEAR */}
        <div 
            onClick={() => inputMode === 'spark' && setInputMode('text')}
            className="flex-1 h-20 bg-white/80 backdrop-blur-xl rounded-[2rem] px-8 flex items-center shadow-2xl shadow-clay-500/10 border border-white focus-within:ring-2 focus-within:ring-crimson/20 transition-all relative group cursor-text"
        >
            <div className="flex-1 overflow-hidden flex items-center whitespace-nowrap">
              <span className={`text-3xl font-medium tracking-tight inline-flex items-center ${typedText ? 'text-clay-900' : 'text-clay-400'}`}>
                {typedText ? (
                  <>
                    {typedText}
                    <span className="w-0.5 h-8 bg-crimson ml-1 animate-pulse inline-block rounded-full" />
                  </>
                ) : (
                  <>
                    <span className="w-0.5 h-8 bg-crimson mr-2 animate-pulse inline-block rounded-full" />
                    <span className="text-clay-300 font-normal">Start typing...</span>
                  </>
                )}
              </span>
            </div>
            
            {/* Clear Button */}
            {(typedText.length > 0 || schedulerAddingToBlock) && (
                <button 
                    onClick={handleClear}
                    className="absolute right-6 p-2 text-clay-400 hover:text-crimson rounded-full hover:bg-crimson/5 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            )}
        </div>

        {/* INPUT ACTIONS */}
        <div className="flex gap-2">
            {/* Backspace */}
            <button 
                onClick={handleBackspace}
                className="w-20 h-20 rounded-[2rem] bg-white border border-white text-clay-400 hover:text-clay-900 hover:border-clay-300 shadow-xl shadow-clay-500/10 transition-all flex items-center justify-center active:scale-95"
                aria-label="Backspace"
            >
                <Delete className="w-7 h-7" />
            </button>
            
            {/* Speak - Crimson Gradient */}
            <button 
                onClick={handleSpeak}
                className={`w-28 h-20 rounded-[2rem] text-white shadow-xl transition-all flex items-center justify-center ${
                  schedulerAddingToBlock
                    ? 'bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400'
                    : 'bg-crimson shadow-crimson/30 hover:bg-[#ff4f4f]'
                } active:scale-95`}
                aria-label={schedulerAddingToBlock ? "Confirm Add" : "Speak"}
            >
                {schedulerAddingToBlock ? <Check className="w-9 h-9" /> : <Volume2 className="w-9 h-9" />}

            </button>
        </div>
      </div>
      )}

      {/* BOTTOM ROW (Suggestions) */}
      {(inputMode === 'text' || schedulerAddingToBlock) && (
        <div className="shrink-0 px-6 relative z-30">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-6 pt-1 -mx-2 px-2">
              {isPredicting && (typedText && typedText.trim() !== '') ? (
                  // LOADING SKELETONS
                  [1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 min-w-[140px] px-8 h-16 rounded-[1.5rem] bg-white/40 border border-white/60 flex items-center justify-center">
                          <div className="h-2 w-16 bg-clay-300/50 rounded-full animate-pulse" />
                      </div>
                  ))
              ) : (
              wordSuggestions.length > 0 ? wordSuggestions.map((sug) => (
                <button 
                  key={sug.id}
                  onClick={(e) => {
                    reinforceHabit(sug.label);
                    // Smart completion: Replace last word if it matches prefix
                    // Force lowercase for suggestions too
                    const label = sug.label.toLowerCase(); 
                    
                    if (!typedText) {
                      setTypedText(label + ' ');
                    } else {
                      const words = typedText.split(' ');
                      const lastWord = words[words.length - 1];
                      if (lastWord && label.startsWith(lastWord.toLowerCase())) {
                         words[words.length - 1] = label;
                         setTypedText(words.join(' ') + ' ');
                      } else {
                         // Add space BEFORE if needed, and ALWAYS add space AFTER
                         const prefix = typedText.endsWith(' ') ? '' : ' ';
                         setTypedText(typedText + prefix + label + ' ');
                      }
                    }
                  }}
                  className="flex-1 min-w-[140px] px-8 h-16 rounded-[1.5rem] bg-white/70 backdrop-blur-md text-clay-800 font-medium text-lg border border-white shadow-md shadow-clay-500/5 hover:shadow-lg hover:scale-[1.02] hover:bg-white hover:text-black hover:border-crimson/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  {sug.label}
                </button>
              )) : (
                 <div className="w-full flex items-center justify-center h-16 text-clay-400/60 text-sm italic border border-dashed border-clay-300/50 rounded-[1.5rem]">
                    Thinking of suggestions...
                 </div>
              ))}
            </div>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="flex-1 min-h-0 bg-clay-200/50 border-t border-white/20 relative z-0 flex flex-col backdrop-blur-md rounded-b-[2rem] shadow-inner">
           {/* Subtle Dot Matrix Background */}
           <div className="absolute inset-0 pointer-events-none opacity-10" 
                style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
           
           <div className="flex-1 overflow-hidden p-2 sm:p-4 z-10 w-full h-full relative">
              {(inputMode === 'text' || schedulerAddingToBlock) ? (
                <div className="w-full h-full flex flex-col">
                    {/* Optional: Add Indicator Header */}
                    {schedulerAddingToBlock && (
                      <div className="mb-2 px-2 flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-top-2">
                         <Plus className="w-4 h-4" />
                         <span className="font-bold text-sm uppercase tracking-wider">Adding to {schedulerAddingToBlock}</span>
                      </div>
                    )}
                    <VirtualKeyboard onKeyPress={handleKeyPress} />
                </div>
              ) : inputMode === 'picture' ? (
                <div className="h-full w-full flex flex-col">
                     <PictureGrid onSelect={handlePictureSelect} />
                </div>
              ) : inputMode === 'schedule' ? (
                <div className="h-full w-full flex flex-col">
                     <SchedulerView />
                </div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-clay-400 gap-4 p-6 pt-24">
                    <div className="text-center mb-2">
                        <h3 className="text-lg font-bold text-crimson">Spark Mode</h3>
                        <p className="text-sm opacity-60 text-clay-500">Neural conversation starters</p>
                    </div>

                    {isPredicting ? (
                       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full h-full overflow-y-auto pb-4 content-start">
                           {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                               <div key={i} className="rounded-[1.5rem] bg-white/40 border border-white/60 animate-pulse min-h-[110px]" />
                           ))}
                       </div>
                    ) : (
                         <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full h-full overflow-y-auto pb-4 content-start">
                            {suggestions.slice(0, 12).map((sug) => (
                                <button
                                    key={sug.id}
                                    onClick={() => {
                                      setTypedText(sug.text);
                                      setInputMode('text');
                                    }}
                                    className="relative group p-5 rounded-[1.5rem] bg-white shadow-sm hover:shadow-md border border-white hover:border-crimson/20 transition-all flex flex-col justify-between gap-3 text-left min-h-[110px] active:scale-[0.98]"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-crimson font-bold text-xs tracking-wide uppercase truncate pr-2 opacity-90">{sug.label}</span>
                                        <Volume2 className="w-3.5 h-3.5 text-clay-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </div>
                                    <p className="text-clay-900 font-medium text-sm sm:text-base leading-snug line-clamp-3">
                                        {sug.text}
                                    </p>
                                    <div className="absolute inset-0 rounded-[1.5rem] ring-2 ring-crimson/0 group-hover:ring-crimson/5 transition-all" />
                                </button>
                            ))}
                         </div>
                    )}
                </div>
              )}
           </div>
      </div>
      {showTimePicker && (
        <TimePicker 
          initialTime={getInitialTimeForBlock()}
          initialDuration={30}
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
        />
      )}
    </div>
  );
}

