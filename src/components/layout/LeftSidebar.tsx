import React, { useState, useRef, useEffect } from 'react';
import { useStore, AppState } from '../../store/useStore';
import { speakText } from '@/lib/elevenlabs';
import { 
  Volume2, 
  Activity, 
  Cpu, 
  Clock, 
  Database, 
  BarChart2, 
  AlignLeft, 
  Search, 
  Smile, 
  Mic, 
  MicOff,
  History,
  BrainCircuit
} from 'lucide-react';

export default function LeftSidebar() {
  const { history, isListening } = useStore((state: AppState) => state);
  const [activeTab, setActiveTab] = useState<'history' | 'brain'>('history');
  const dummyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'history') {
      dummyRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeTab]);

  const handlePlay = async (text: string) => {
    try {
      await speakText(text);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <aside className="w-80 h-full border-r border-slate-700/30 bg-slate-900/80 backdrop-blur-xl flex flex-col font-sans text-slate-200 transition-all duration-300">
      
      {/* TAB HEADER */}
      <div className="flex items-center p-2 gap-2 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'history' 
              ? 'bg-slate-800 text-sky-400 shadow-sm' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
           <History className="w-4 h-4" />
           <span>History</span>
        </button>
        <button 
          onClick={() => setActiveTab('brain')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'brain' 
              ? 'bg-slate-800 text-indigo-400 shadow-sm' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
           <BrainCircuit className="w-4 h-4" />
           <span>Engine</span>
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* === TAB 1: CONVERSATION HISTORY === */}
        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-60">
                    <History className="w-12 h-12 mb-2 stroke-1" />
                    <p className="text-sm">No recent history</p>
                </div>
            )}
            {history.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[90%] ${
                  msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div className={`p-4 relative shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-slate-800/60 backdrop-blur-sm border border-white/5 text-slate-200 rounded-2xl rounded-tl-sm'
                }`}>
                   <p className="text-sm leading-relaxed whitespace-pre-wrap">
                     {msg.content}
                   </p>

                   {/* PLAY AUDIO BUTTON - For BOTH User and Assistant */}
                   <div className={`mt-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <button 
                         onClick={(e) => {
                             e.currentTarget.blur();
                             handlePlay(msg.content);
                         }}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-md transition-all active:scale-95 ${
                           msg.role === 'user'
                            ? 'bg-white/20 hover:bg-white/30 text-white'
                            : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white'
                       }`}>
                           <Volume2 className="w-3.5 h-3.5" />
                           {msg.role === 'user' ? 'Repeat' : 'Replay'}
                       </button>
                   </div>
                </div>
                
                <span className="text-[10px] text-slate-500 mt-1 px-1 opacity-60 font-medium">
                    {msg.role === 'user' ? 'You' : 'Partner'}
                </span>
              </div>
            ))}
            <div ref={dummyRef} />
          </div>
        )}

        {/* === TAB 2: 7-SIGNAL ENGINE === */}
        {activeTab === 'brain' && (
          <div className="h-full overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
             
             {/* Intro Card */}
             <div className="col-span-1 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                 <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">System Architecture</h3>
                 <p className="text-xs text-slate-400">ThoughtFlow Engine v1.0 connected.</p>
             </div>

             <div className="space-y-3">
                 {/* 1. THE LISTENER */}
                 <div className={`p-3 rounded-xl border transition-all ${isListening ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/30 border-white/5'}`}>
                     <div className="flex items-center gap-3 mb-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isListening ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                             {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                         </div>
                         <div>
                             <h4 className="text-sm font-bold text-slate-200">The Listener</h4>
                             <p className="text-[10px] text-slate-500">Audio Context • Deaf by Default</p>
                         </div>
                     </div>
                     <div className="flex items-center justify-between px-1">
                         <span className="text-[10px] text-slate-400 uppercase tracking-wider">{isListening ? 'Conversation Mode' : 'Privacy Mode'}</span>
                         <span className={`text-[10px] font-bold uppercase ${isListening ? 'text-emerald-400' : 'text-slate-500'}`}>{isListening ? 'ACTIVE' : 'OFFLINE'}</span>
                     </div>
                 </div>

                 {/* 2. THE SCHEDULER */}
                 <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                         <Clock className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                         <h4 className="text-sm font-bold text-slate-200">The Scheduler</h4>
                         <div className="flex justify-between items-center mt-1">
                             <span className="text-[10px] text-slate-400">Time Context</span>
                             <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">12:42 PM • Lunch</span>
                         </div>
                     </div>
                 </div>

                 {/* 3. THE MEMORY */}
                 <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                         <Database className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                         <h4 className="text-sm font-bold text-slate-200">The Memory</h4>
                         <div className="flex justify-between items-center mt-1">
                             <span className="text-[10px] text-slate-400">Long-Term (Backboard.io)</span>
                             <div className="flex gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-100"></span>
                                 <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-75"></span>
                                 <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* 4. THE FREQUENCY */}
                 <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                         <BarChart2 className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                         <h4 className="text-sm font-bold text-slate-200">The Frequency</h4>
                         <div className="flex justify-between items-center mt-1">
                             <span className="text-[10px] text-slate-400">Short-Term Habit (Atlas)</span>
                             <div className="h-1 w-12 bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-amber-500 w-3/4"></div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* 5. THE GRAMMAR */}
                 <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                         <AlignLeft className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                         <h4 className="text-sm font-bold text-slate-200">The Grammar</h4>
                         <div className="flex justify-between items-center mt-1">
                             <span className="text-[10px] text-slate-400">Predictive Syntax</span>
                             <span className="text-[10px] text-slate-500">Ready</span>
                         </div>
                     </div>
                 </div>

                 {/* 6. THE FILTER */}
                 <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                         <Search className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                         <h4 className="text-sm font-bold text-slate-200">The Filter</h4>
                         <div className="flex justify-between items-center mt-1">
                             <span className="text-[10px] text-slate-400">Spelling Constraint</span>
                             <span className="text-[10px] text-slate-500">Auto</span>
                         </div>
                     </div>
                 </div>

                 {/* 7. THE VIBE */}
                 <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                         <Smile className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                         <h4 className="text-sm font-bold text-slate-200">The Vibe</h4>
                         <div className="flex justify-between items-center mt-1">
                             <span className="text-[10px] text-slate-400">Tone Modulation</span>
                             <span className="text-[10px] text-teal-300">Empathic</span>
                         </div>
                     </div>
                 </div>
             
             </div>
          </div>
        )}

      </div>
    </aside>
  );
}
