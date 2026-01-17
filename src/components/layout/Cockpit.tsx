"use client";
import React from 'react';
import { useStore } from '@/store/useStore';
import { Activity, Keyboard, Grid, Zap, Volume2 } from 'lucide-react';
import VirtualKeyboard from './VirtualKeyboard';
import PictureGrid from './PictureGrid';
import { speakText } from '@/lib/elevenlabs';

export default function Cockpit() {
  const { isListening, inputMode, setInputMode, typedText, setTypedText, suggestions } = useStore();

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
    await speakText(typedText);
  };

  const wordSuggestions = suggestions.slice(0, 3); // Take first 3 for the "Blue Buttons"

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 relative overflow-hidden">
      {/* BACKGROUND GRID EFFECT */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* ZONE 1: SENSOR ARRAY (Green Waveform Visualizer) */}
      <div className="h-24 border-b border-slate-800 flex items-center justify-center relative bg-slate-900/50 backdrop-blur-md z-10">
        {isListening ? (
           <div className="flex items-center gap-1 h-12">
             {[...Array(20)].map((_, i) => (
               <div 
                 key={i}
                 className="w-2 bg-neon-green rounded-full animate-pulse"
                 style={{ 
                   height: `${Math.random() * 100}%`,
                   animationDelay: `${i * 0.05}s`
                 }} 
               />
             ))}
           </div>
        ) : (
          <div className="text-slate-600 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Sensor Array Idle
          </div>
        )}
      </div>

      {/* ZONE 2: INPUT & WORK SURFACE */}
      <div className="flex-1 flex flex-col p-4 gap-4 z-10 overflow-hidden">
        
        {/* THE TEXT BAR (What user is typing) */}
        <div className="min-h-[100px] bg-slate-900 border-2 border-slate-700 rounded-xl p-2 flex items-center shadow-inner gap-2">
           <div className="flex-1 p-2 overflow-hidden">
             <span className="text-3xl font-bold text-white tracking-wide font-mono whitespace-nowrap">
               {typedText}<span className="animate-pulse text-neon-green">_</span>
             </span>
           </div>
           
           {/* BIG SPEAK BUTTON */}
           <button 
             onClick={handleSpeak}
             className="h-full aspect-square bg-neon-green text-black rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] active:scale-95 transition-all"
           >
             <Volume2 className="w-8 h-8" />
             <span className="text-xs font-black uppercase">Speak</span>
           </button>
        </div>

        {/* MODE SPECIFIC SURFACE */}
        <div className="flex-1 overflow-hidden flex flex-col gap-2">
          
          {inputMode === 'text' && (
            <div className="flex gap-2 h-14 mb-2">
              {/* WORD PREDICTIONS (Blue Buttons) above keyboard */}
              {wordSuggestions.map((sug) => (
                <button 
                  key={sug.id}
                  onClick={() => setTypedText(typedText + " " + sug.label)}
                  className="flex-1 bg-cyan-900/40 border border-cyan-500/50 text-cyan-300 rounded-lg hover:bg-cyan-800/60 font-bold text-lg transition-colors"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 bg-slate-900/30 rounded-xl border border-slate-800/50 overflow-hidden">
             {inputMode === 'text' ? (
               <VirtualKeyboard onKeyPress={handleKeyPress} />
             ) : (
               <PictureGrid onSelect={handlePictureSelect} />
             )}
          </div>
        </div>

      </div>

      {/* ZONE 3: FOOTER TOGGLES */}
      <div className="h-20 border-t border-slate-800 bg-slate-900/80 p-4 z-10 flex gap-4">
        <button 
          onClick={() => setInputMode('text')}
          className={`flex-1 rounded-lg flex flex-col items-center justify-center gap-1 font-bold ${inputMode === 'text' ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <Keyboard className="w-5 h-5" />
          <span className="text-xs">KEYBOARD</span>
        </button>

        <button 
          onClick={() => setInputMode('picture')}
          className={`flex-1 rounded-lg flex flex-col items-center justify-center gap-1 font-bold ${inputMode === 'picture' ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-xs">PICTURES</span>
        </button>

        <button 
          className="flex-1 rounded-lg flex flex-col items-center justify-center gap-1 font-bold bg-purple-900/20 border border-purple-500/50 text-purple-400 hover:bg-purple-900/40 hover:text-purple-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
        >
          <Zap className="w-5 h-5" />
          <span className="text-xs">SPARK</span>
        </button>
      </div>
    </div>
  );
}
