"use client";
import React, { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Activity, Volume2, X, Delete } from 'lucide-react';
import VirtualKeyboard from './VirtualKeyboard';
import PictureGrid from './PictureGrid';
import WaveformVisualizer from '../ui/WaveformVisualizer';
import { speakText } from '@/lib/elevenlabs';

export default function Cockpit() {
  const { isListening, inputMode, setInputMode, typedText, setTypedText, suggestions } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a real input (if we had any) or modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const state = useStore.getState();
      const currentText = state.typedText;

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
      setTypedText(typedText + key);
    }
  };

  const handlePictureSelect = (label: string) => {
    setTypedText(typedText ? `${typedText} ${label}` : label);
  };
  
    const handleSpeak = async () => {
      if (!typedText) return;
      console.log('Speaking:', typedText);
      const ok = await speakText(typedText);
      if (!ok) console.error('TTS failed');
    };

  const handleClear = () => {
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

  const wordSuggestions = suggestions.slice(0, 4);

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* HEADER / STATUS - Compact */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 gap-4">
        {/* VISUALIZER */}
        <div className="flex-1 h-12 rounded-2xl bg-slate-800/30 backdrop-blur-sm overflow-hidden relative border border-white/5">
            <WaveformVisualizer isActive={isListening} />
            {!isListening && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-600 gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ready</span>
                </div>
            )}
        </div>

        {/* MODE TOGGLES */}
        <div className="h-10 bg-slate-800 p-1 rounded-xl flex items-center shrink-0 border border-white/5">
            {(['text', 'picture', 'spark'] as const).map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`px-4 h-full rounded-lg text-xs font-semibold transition-all duration-200 capitalize ${
                    inputMode === mode 
                    ? 'bg-slate-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {mode}
                </button>
            ))}
        </div>
      </div>

      {/* INPUT ZONE - Row 2 (Now Middle) */}
      <div className="shrink-0 px-6 pb-4 flex items-stretch gap-3">
        {/* INPUT BAR + CLEAR */}
        <div className="flex-1 h-16 bg-slate-800/50 backdrop-blur-md rounded-2xl px-5 flex items-center shadow-lg border border-white/5 focus-within:bg-slate-800/80 transition-all relative group">
            <div className="flex-1 overflow-hidden flex items-center whitespace-nowrap">
              <span className={`text-xl font-medium tracking-tight inline-flex items-center ${typedText ? 'text-white' : 'text-slate-500'}`}>
                {typedText ? (
                  <>
                    {typedText}
                    <span className="w-0.5 h-6 bg-sky-400 ml-2 animate-pulse inline-block" />
                  </>
                ) : (
                  <>
                    <span className="w-0.5 h-6 bg-sky-400 mr-2 animate-pulse inline-block" />
                    <span className="text-slate-500">Start typing...</span>
                  </>
                )}
              </span>
            </div>
            
            {/* Clear Button - Only visible if text exists */}
            {typedText.length > 0 && (
                <button 
                    onClick={handleClear}
                    className="absolute right-4 p-1.5 text-slate-500 hover:text-white rounded-full hover:bg-slate-600/50 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>

        {/* INPUT ACTIONS */}
        <div className="flex gap-2">
            {/* Backspace */}
            <button 
                onClick={handleBackspace}
                className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-slate-700/80 transition-all flex items-center justify-center active:scale-95 shadow-md"
                aria-label="Backspace"
            >
                <Delete className="w-6 h-6" />
            </button>
            
            {/* Speak - Blue/Cyan Gradient */}
            <button 
                onClick={handleSpeak}
                className="w-20 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-900/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Speak"
            >
                <Volume2 className="w-7 h-7" />
            </button>
        </div>
      </div>

      {/* SUGGESTIONS PILLS - Row 1 (Now Bottom - larger) */}
      {inputMode === 'text' && (
        <div className="shrink-0 px-6 pb-4">
            <div className="flex gap-3 h-14 overflow-x-auto scrollbar-hide">
              {wordSuggestions.length > 0 ? wordSuggestions.map((sug) => (
                <button 
                  key={sug.id}
                  onClick={() => setTypedText(typedText + " " + sug.label)}
                  className="flex-1 min-w-[120px] px-6 h-full rounded-2xl bg-slate-800 border border-sky-500/30 text-sky-400 text-lg font-medium hover:bg-slate-700 hover:text-sky-300 hover:border-sky-400/50 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                >
                  {sug.label}
                </button>
              )) : (
                 <div className="w-full flex items-center justify-center h-full text-slate-600 text-sm italic border border-dashed border-slate-800 rounded-2xl">
                    Thinking of suggestions...
                 </div>
              )}
            </div>
        </div>
      )}

      {/* MAIN WORKSPACE - Grow Container */}
      <div className="flex-1 min-h-0 bg-slate-800/20 border-t border-white/5 relative flex flex-col">
           {/* Subtle Grid Background */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
           
           <div className="flex-1 overflow-hidden p-2 sm:p-4 z-10 w-full h-full relative">
              {inputMode === 'text' ? (
                <VirtualKeyboard onKeyPress={handleKeyPress} />
              ) : inputMode === 'picture' ? (
                <div className="h-full w-full flex flex-col">
                     <PictureGrid onSelect={handlePictureSelect} />
                </div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-4">
                    <div className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center animate-pulse">
                        <Activity className="w-8 h-8 text-sky-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-sky-300">Spark Mode</h3>
                        <p className="text-sm opacity-60">Neural predictive text engine</p>
                    </div>
                </div>
              )}
           </div>
      </div>

    </div>
  );
}

