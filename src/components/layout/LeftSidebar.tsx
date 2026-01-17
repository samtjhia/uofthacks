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
  BrainCircuit,
  Terminal,
  Zap
} from 'lucide-react';

export default function LeftSidebar() {
  const { history, isListening, fetchHistory, engineLogs, cacheStats } = useStore((state: AppState) => state);
  const [activeTab, setActiveTab] = useState<'history' | 'brain'>('history');
  const dummyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
     // Scroll to top of logs when updated, or bottom? Usually terminals scroll to bottom.
     if (activeTab === 'brain') {
        // dummyRef is at bottom
        dummyRef.current?.scrollIntoView({ behavior: 'smooth' });
     }
  }, [engineLogs, activeTab]);

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
                           <span>Speak</span>
                       </button>
                   </div>
                </div>
                <div className="mt-1 px-2 text-[10px] text-slate-500 font-medium opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={dummyRef} />
          </div>
        )}

        {/* === TAB 2: ENGINE BRAIN (Terminal View) === */}
        {activeTab === 'brain' && (
           <div className="h-full flex flex-col font-mono text-xs overflow-hidden">
              {/* Stats Header */}
              <div className="shrink-0 p-4 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="font-bold">ONLINE</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Database className="w-3.5 h-3.5" />
                        <span>Cache: <span className="text-slate-200">{cacheStats?.size || 0}/{cacheStats?.max || 50}</span></span>
                    </div>
                 </div>
                 <div className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">gemini-2.0-flash-exp</div>
              </div>

              {/* Terminal Logs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/40">
                  {engineLogs.length === 0 && (
                      <div className="text-slate-600 italic mt-10 text-center">Engine standby...</div>
                  )}
                  {/* Reverse logs to show newest at bottom if we flex-col-reverse, OR just map normally and scroll to bottom */}
                  {[...engineLogs].reverse().map((log) => (
                      <div key={log.id} className="flex gap-3">
                          <span className="shrink-0 text-slate-600 select-none">[{log.timestamp}]</span>
                          <span className={`${
                              log.type === 'error' ? 'text-red-400' :
                              log.type === 'success' ? 'text-emerald-400' :
                              log.type === 'warning' ? 'text-amber-400' :
                              'text-sky-300'
                          }`}>
                              {log.type === 'info' && <span className="mr-2 opacity-50">$</span>}
                              {log.message}
                          </span>
                      </div>
                  ))}
                  <div ref={dummyRef} />
              </div>

                {/* Input Simulation (Visual only) */}
                <div className="shrink-0 p-2 bg-black/60 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-500 px-2">
                        <span>{'>'}</span>
                        <span className="animate-pulse">_</span>
                    </div>
                </div>
           </div>
        )}

      </div>
    </aside>
  );
}
