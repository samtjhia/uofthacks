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
  // CRITICAL UPDATE: If input is empty, we default to [Yes, No, Hi, Thanks]...
  // UNLESS we have high-quality predictions from the "Brain" because the partner just spoke.
  // We can detect this if 'suggestions' are populated even when typedText is empty.
  const wordSuggestions = (!typedText || typedText.trim() === '')
    ? (suggestions.length > 0 && !suggestions[0].id.startsWith('grammar-') ? suggestions.slice(0, 4) : DEFAULTS)
    : suggestions.slice(0, 4);

  return (
    <div className="flex-1 h-full flex flex-col bg-transparent text-clay-900 font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between gap-4">
        {/* Visualizer / Status */}
        <div className="flex-1 h-14 rounded-full bg-white/90 backdrop-blur-md overflow-hidden relative border border-white/60 shadow-lg">
            <WaveformVisualizer isActive={isListening} />
            {!isListening && (
                <div className="absolute inset-0 flex items-center justify-center text-clay-500 gap-2 pb-2.5">
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">System Ready</span>
                </div>
            )}
        </div>

        {/* MODE TOGGLES */}
        <div className="h-14 bg-white/90 p-1.5 rounded-full flex items-center shrink-0 border border-white/60 backdrop-blur-md shadow-lg">
            {(['text', 'picture', 'spark', 'schedule'] as const).map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`px-6 h-full rounded-full text-xs font-bold transition-all duration-300 capitalize tracking-wide ${
                    inputMode === mode 
                    ? 'bg-clay-100 text-clay-900 shadow-sm ring-1 ring-black/5' 
                    : 'text-clay-500 hover:text-clay-800 hover:bg-white/40'
                  }`}
                >
                  {mode}
                </button>
            ))}
        </div>

        {/* AI ASSIST TOGGLE (Animated) */}
        <div 
            className={`transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden flex items-center ${
                inputMode === 'picture' ? 'max-w-[200px] opacity-100 ml-3 py-6 -my-6' : 'max-w-0 opacity-0 ml-0 py-0'
            }`}
        >
             <button 
               onClick={toggleHighlight}
               className={`h-14 min-w-max flex items-center gap-3 px-6 rounded-full border transition-all duration-300 shadow-lg whitespace-nowrap ${
                 isHighlightEnabled 
                 ? 'bg-azure-100/90 border-azure-200' 
                 : 'bg-white/90 border-white/60 hover:bg-white/95'
               }`}
             >
                <div className="flex flex-col items-start gap-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${isHighlightEnabled ? 'text-azure-600' : 'text-clay-500'}`}>
                        AI Assist
                    </span>
                    <span className="text-[10px] opacity-60 leading-none text-clay-500">
                        {isHighlightEnabled ? 'Active' : 'Off'}
                    </span>
                </div>
                
                {/* Switch Graphic */}
                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                    isHighlightEnabled ? 'bg-azure-500' : 'bg-clay-300'
                }`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${
                        isHighlightEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                </div>
             </button>
        </div>
      </div>

      {/* MIDDLE ROW (Input) */}
      {(inputMode !== 'schedule' || schedulerAddingToBlock) && (
      <div className="shrink-0 px-6 pb-4 flex items-stretch gap-4">
        {/* INPUT BAR + CLEAR */}
        <div 
            onClick={() => inputMode === 'spark' && setInputMode('text')}
            className="flex-1 h-20 bg-white/90 backdrop-blur-xl rounded-[2rem] px-8 flex items-center shadow-lg border border-white/60 focus-within:bg-white/90 focus-within:shadow-xl transition-all relative group cursor-text"
        >
            <div className="flex-1 overflow-hidden flex items-center whitespace-nowrap">
              <span className={`text-2xl font-medium tracking-tight inline-flex items-center ${typedText ? 'text-clay-900' : 'text-clay-400'}`}>
                {typedText ? (
                  <>
                    {typedText}
                    <span className="w-0.5 h-8 bg-crimson ml-[2px] animate-pulse inline-block" />
                  </>
                ) : (
                  <>
                    <span className="w-0.5 h-8 bg-crimson mr-2 animate-pulse inline-block" />
                    <span className="text-clay-400">Start typing...</span>
                  </>
                )}
              </span>
            </div>
            
            {/* Clear Button - Only visible if text exists OR editing schedule */}
            {(typedText.length > 0 || schedulerAddingToBlock) && (
                <button 
                    onClick={handleClear}
                    className="absolute right-6 p-2 text-clay-400 hover:text-crimson rounded-full hover:bg-crimson/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>

        {/* INPUT ACTIONS */}
        <div className="flex gap-3">
            {/* Backspace */}
            <button 
                onClick={handleBackspace}
                className="w-20 h-20 rounded-[2rem] bg-white/90 border border-white/60 text-clay-600 hover:text-crimson hover:border-crimson/30 hover:bg-white/95 transition-all flex items-center justify-center active:scale-95 shadow-lg"
                aria-label="Backspace"
            >
                <Delete className="w-7 h-7" />
            </button>
            
            {/* Speak - Crimson Block */}
            <button 
                onClick={handleSpeak}
                className={`w-24 h-20 rounded-[2rem] text-white shadow-lg transition-all flex items-center justify-center ${
                  schedulerAddingToBlock
                    ? 'bg-emerald-500 shadow-emerald-900/20'
                    : 'bg-crimson shadow-crimson/30 hover:shadow-crimson/40'
                } hover:scale-105 active:scale-95`}
                aria-label={schedulerAddingToBlock ? "Confirm Add" : "Speak"}
            >
                {schedulerAddingToBlock ? <Check className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}

            </button>
        </div>
      </div>
      )}

      {/* BOTTOM ROW (Suggestions) */}
      {(inputMode === 'text' || schedulerAddingToBlock) && (
        <div className="shrink-0 px-6 pb-2">
            <div className="flex gap-3 h-16 overflow-x-auto scrollbar-hide">
              {isPredicting && (typedText && typedText.trim() !== '') ? (
                  // LOADING SKELETONS
                  [1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 min-w-[140px] px-6 h-full rounded-full bg-white/40 border border-white/60 flex items-center justify-center animate-pulse">
                          <div className="h-2 w-16 bg-clay-200 rounded-full" />
                      </div>
                  ))
              ) : (
              wordSuggestions.length > 0 ? wordSuggestions.map((sug) => (
                <button 
                  key={sug.id}
                  onClick={(e) => {
                    reinforceHabit(sug.label);
                    // Smart completion
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
                         const prefix = typedText.endsWith(' ') ? '' : ' ';
                         setTypedText(typedText + prefix + label + ' ');
                      }
                    }
                  }}
                  className="flex-1 min-w-[140px] px-8 h-full rounded-2xl bg-white/70 border border-white/60 text-clay-800 text-xl font-medium hover:bg-white hover:text-crimson hover:border-crimson/20 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  {sug.label}
                </button>
              )) : (
                 <div className="w-full flex items-center justify-center h-full text-clay-400 text-sm italic border border-dashed border-clay-300 rounded-2xl">
                    Thinking of suggestions...
                 </div>
              ))}
            </div>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="flex-1 min-h-0 bg-transparent relative flex flex-col">
           {/* Subtle Grid Background */}
           {/* Removing background grid as the main page handles it mostly, keeping it clean */}
           
           <div className="flex-1 overflow-hidden p-2 sm:p-4 md:px-10 z-10 w-full h-full relative">
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
                <div className="h-full w-full flex flex-col items-center justify-center text-clay-500 gap-6 p-6 pt-4">
                    <div className="w-full text-center mb-4 bg-white/70 px-10 py-6 rounded-[2.5rem] backdrop-blur-md border border-white/60 shadow-lg shadow-clay-200/50">
                        <h3 className="text-3xl font-bold text-clay-900 mb-1 tracking-tight">Spark Mode</h3>
                        <p className="text-base font-medium text-clay-600">Neural conversation starters</p>
                    </div>

                    {isPredicting ? (
                       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full h-full overflow-y-auto pb-4 content-start">
                           {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                               <div key={i} className="rounded-[2rem] bg-white/30 border border-white/50 animate-pulse min-h-[140px]" />
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
                                    className="relative group p-6 rounded-[2rem] bg-white/40 hover:bg-white border border-white/60 hover:border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between gap-4 text-left min-h-[140px]"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-crimson font-bold text-xs tracking-wide uppercase truncate pr-2 opacity-80">{sug.label}</span>
                                        <Volume2 className="w-4 h-4 text-clay-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </div>
                                    <p className="text-clay-900 font-medium text-lg leading-snug line-clamp-3">
                                        {sug.text}
                                    </p>
                                    <div className="absolute inset-0 rounded-[2rem] ring-1 ring-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          initialDuration={30}
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
        />
      )}
    </div>
  );
}

