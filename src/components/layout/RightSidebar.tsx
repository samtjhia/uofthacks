import React from 'react';
import { useStore } from '@/store/useStore';
import { Mic, MicOff, Smile, Frown, Meh, Heart, MessageCircle } from 'lucide-react';

export default function RightSidebar() {
  const { isListening, toggleListening, suggestions, setTypedText, typedText } = useStore();

  return (
    <aside className="w-80 h-full border-l border-slate-700/30 bg-slate-900/80 backdrop-blur-xl flex flex-col font-sans text-slate-200">
      
      {/* TOP SECTION: SUGGESTED PHRASES */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 pb-2">
            <h2 className="text-xl font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Suggestions
            </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
          {suggestions.map((sug, idx) => (
             <button
               key={sug.id}
               onClick={() => setTypedText(sug.text)}
               className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
             >
                {/* Subtle highlight effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="relative z-10">
                 <div className="font-semibold text-sm text-slate-200 mb-1 group-hover:text-sky-300 transition-colors">
                   {sug.label}
                 </div>
                 <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                   "{sug.text}"
                 </div>
               </div>
             </button>
          ))}
        </div>
      </div>


      {/* BOTTOM SECTION: CONTROLS */}
      <div className="flex-none p-6 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

        {/* LISTENER BUTTON - Centerpiece */}
        <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-4">
                {isListening ? 'Listening...' : 'Tap to Listen'}
            </span>
            
          <button
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? 'bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* TONE SELECTOR */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 border border-white/5">
          <label className="block text-xs text-slate-400 font-medium mb-3 text-center">Response Tone</label>
          <div className="flex justify-between items-center px-2">
            {[
              { icon: Meh, label: "Neutral", color: 'text-slate-300' },
              { icon: Smile, label: "Happy", color: 'text-sky-400' },
              { icon: Frown, label: "Serious", color: 'text-indigo-400' },
              { icon: Heart, label: "Empath", color: 'text-teal-400' }
            ].map((tone, idx) => (
              <button 
                key={idx} 
                className="group flex flex-col items-center gap-1.5"
                title={tone.label}
              >
                <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 border border-white/5">
                    <tone.icon className={`w-5 h-5 ${tone.color} opacity-80 group-hover:opacity-100`} />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
