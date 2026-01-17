import React from 'react';
import { useStore } from '@/store/useStore';
import { Mic, MicOff, Smile, Frown, Meh, Heart, MessageCircle } from 'lucide-react';

export default function RightSidebar() {
  const { isListening, toggleListening, suggestions, setTypedText, typedText } = useStore();

  return (
    <aside className="w-80 h-full border-l border-slate-800 bg-slate-950 flex flex-col">
      
      {/* TOP SECTION: SUGGESTED PHRASES (Ghost Text) */}
      <div className="flex-1 flex flex-col border-b border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-slate-100 uppercase text-sm tracking-wider">Suggested Phrases</h2>
        </div>
        
        <div className="p-4 space-y-3 overflow-y-auto">
          {suggestions.map((sug) => (
             <button
               key={sug.id}
               onClick={() => setTypedText(sug.text)}
               className="w-full text-left p-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-cyan-500/50 group transition-all"
             >
               <div className="font-bold text-slate-200 group-hover:text-cyan-300">{sug.label}</div>
               <div className="text-xs text-slate-500 italic mt-1 group-hover:text-cyan-400/70">"{sug.text}"</div>
             </button>
          ))}
        </div>
      </div>


      {/* BOTTOM SECTION: CONTROLS */}
      <div className="flex-none p-4 space-y-4 bg-slate-925">
        
        {/* LISTENER TOGGLE */}
        <div>
          <button
            onClick={toggleListening}
            className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg ${
              isListening
                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-6 h-6" />
                <span>STOP LISTENING</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                <span>START LISTENING</span>
              </>
            )}
          </button>
        </div>

        {/* TONE SELECTOR (Compact) */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Tone</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Meh, color: 'text-slate-400' },
              { icon: Smile, color: 'text-yellow-400' },
              { icon: Frown, color: 'text-red-400' },
              { icon: Heart, color: 'text-pink-400' }
            ].map((tone, idx) => (
              <button key={idx} className={`flex items-center justify-center p-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 ${tone.color} hover:shadow-[0_0_10px_currentColor] transition-all`}>
                <tone.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
