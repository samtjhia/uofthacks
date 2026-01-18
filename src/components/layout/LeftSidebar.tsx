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
  const { history, isListening, fetchHistory, engineLogs, cacheStats, activeModel } = useStore((state: AppState) => state);
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
    <aside className="w-full h-full bg-white/30 flex flex-col font-sans transition-all duration-300">
      
      {/* TAB HEADER (Floating Pill Segmented Control) */}
      <div className="p-4 pb-2">
        <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-full border border-white/40 shadow-inner">
            <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === 'history' 
                ? 'bg-white text-clay-900 shadow-md ring-1 ring-black/5 transform scale-100' 
                : 'text-clay-500 hover:text-clay-800'
            }`}
            >
            <History className="w-4 h-4" />
            <span>History</span>
            </button>
            <button 
            onClick={() => setActiveTab('brain')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === 'brain' 
                ? 'bg-white text-crimson shadow-md ring-1 ring-black/5 transform scale-100' 
                : 'text-clay-500 hover:text-clay-800'
            }`}
            >
            <BrainCircuit className="w-4 h-4" />
            <span>Engine</span>
            </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* === TAB 1: CONVERSATION HISTORY === */}
        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-clay-400 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-clay-200/50 flex items-center justify-center mb-4">
                        <History className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No recent history</p>
                </div>
            )}
            {history.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[90%] ${
                  msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div className={`p-4 relative shadow-sm transition-all hover:scale-[1.02] ${
                    msg.role === 'user' 
                      ? 'bg-crimson text-white rounded-[1.5rem] rounded-tr-md shadow-crimson/20 shadow-lg' 
                      : 'bg-white/80 backdrop-blur-md border border-white text-clay-900 rounded-[1.5rem] rounded-tl-md shadow-lg shadow-clay-400/10'
                }`}>
                   <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                     {msg.content}
                   </p>

                   {/* PLAY AUDIO BUTTON - For BOTH User and Assistant */}
                   <div className={`mt-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <button 
                         onClick={(e) => {
                             e.currentTarget.blur();
                             handlePlay(msg.content);
                         }}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm backdrop-blur-md transition-all active:scale-95 ${
                           msg.role === 'user'
                            ? 'bg-black/20 hover:bg-black/30 text-white'
                            : 'bg-clay-200 hover:bg-clay-300 text-clay-600'
                       }`}>
                           <Volume2 className="w-3 h-3" />
                           <span>Replay</span>
                       </button>
                   </div>
                </div>
                <div className="mt-2 px-2 text-[10px] text-clay-500 font-bold opacity-60 uppercase tracking-widest">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={dummyRef} />
          </div>
        )}

        {/* === TAB 2: ENGINE BRAIN (Clean Tech View) === */}
        {activeTab === 'brain' && (
           <div className="h-full flex flex-col font-mono text-xs overflow-hidden bg-clay-100/50">
              {/* Stats Header */}
              <div className="shrink-0 p-4 border-b border-clay-200 bg-white/40 flex items-center justify-between backdrop-blur-sm">
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-crimson">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson"></span>
                        </span>
                        <span className="font-bold tracking-tight">SYSTEM ONLINE</span>
                    </div>
                    <div className="flex items-center gap-2 text-clay-500">
                        <Database className="w-3.5 h-3.5" />
                        <span>MEM: <span className="text-clay-900 font-bold">{cacheStats?.size || 0}</span></span>
                    </div>
                 </div>
              </div>

              {/* Log Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Reverse logs to show newest at bottom if we flex-col-reverse, OR just map normally and scroll to bottom */}
                  {[...engineLogs].reverse().map((log) => (
                      <div key={log.id} className="flex gap-3 group">
                          <span className="shrink-0 text-clay-400 select-none font-bold opacity-50 group-hover:opacity-100 transition-opacity">
                             {log.timestamp.split(' ')[0]}
                          </span>
                          <div className={`flex-1 border-l-2 pl-3 py-0.5 ${
                              log.type === 'error' ? 'border-red-500 text-red-600 bg-red-50/50' :
                              log.type === 'success' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' :
                              log.type === 'warning' ? 'border-amber-500 text-amber-700 bg-amber-50/50' :
                              'border-blue-300 text-slate-700'
                          }`}>
                              <span className="font-medium leading-relaxed block">
                                {log.message}
                              </span>
                          </div>
                      </div>
                  ))}
                  <div ref={dummyRef} />
              </div>
           </div>
        )}

      </div>
    </aside>
  );
}
