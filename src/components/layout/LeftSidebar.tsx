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
  Zap,
  Trash2,
  HardDrive,
  RefreshCw
} from 'lucide-react';

export default function LeftSidebar() {
  const { 
    history, fetchHistory, clearHistory, 
    engineLogs, addEngineLog, 
    cacheStats, activeModel, 
    memories, fetchMemories, clearMemories,
    adminProvider, setAdminProvider   // <--- Added
  } = useStore((state: AppState) => state);
  const [activeTab, setActiveTab] = useState<'history' | 'brain' | 'memory'>('history');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dummyRef = useRef<HTMLDivElement>(null);

  // Hidden Toggle for Admin Provider
  const handleToggleProvider = async () => {
     let next: 'gemini' | 'openai' | null = null;
     if (adminProvider === null) next = 'gemini';
     else if (adminProvider === 'gemini') next = 'openai';
     else next = null; // Back to default

     setAdminProvider(next);

     const msg = `SYSTEM OVERRIDE: AI Model switched to ${next ? next.toUpperCase() : 'DEFAULT'}`;
     addEngineLog(msg, 'warning');
     
     // Log to VS Code Terminal
     try {
       await fetch('/api/log', {
         method: 'POST',
         body: JSON.stringify({ message: msg })
       });
     } catch (e) {
       console.error("Failed to log to server", e);
     }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetch memories when switching to Memory tab
  useEffect(() => {
      if (activeTab === 'memory') {
          fetchMemories();
      }
  }, [activeTab]);

  const handleRefreshMemories = async () => {
      setIsRefreshing(true);
      await fetchMemories();
      setTimeout(() => setIsRefreshing(false), 500);
  };


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
    <aside className="w-full h-full bg-white/40 backdrop-blur-xl flex flex-col font-sans text-clay-900 transition-all duration-300 border-r border-white/20 rounded-r-3xl overflow-hidden">
      
      {/* TAB HEADER */}
      <div className="flex items-center p-2 gap-2 border-b border-clay-900/5">
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${
            activeTab === 'history' 
              ? 'bg-clay-100 text-crimson shadow-sm border border-clay-200' 
              : 'text-clay-500 hover:text-clay-700 hover:bg-clay-50'
          }`}
        >
           <History className="w-4 h-4" />
           <span>History</span>
        </button>
        <button 
          onClick={() => setActiveTab('brain')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${
            activeTab === 'brain' 
              ? 'bg-clay-100 text-crimson shadow-sm border border-clay-200' 
              : 'text-clay-500 hover:text-clay-700 hover:bg-clay-50'
          }`}
        >
           <BrainCircuit className="w-4 h-4" />
           <span>Engine</span>
        </button>
        <button 
          onClick={() => setActiveTab('memory')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all ${
            activeTab === 'memory' 
              ? 'bg-clay-100 text-crimson shadow-sm border border-clay-200' 
              : 'text-clay-500 hover:text-clay-700 hover:bg-clay-50'
          }`}
        >
           <Database className="w-4 h-4" />
           <span>Memory</span>
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* === TAB 1: CONVERSATION HISTORY === */}
        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-clay-300 scrollbar-track-transparent">
            {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-clay-400 gap-2 opacity-60">
                    <History className="w-12 h-12 stroke-1" />
                    <p className="text-sm font-medium">No recent history</p>
                </div>
            )}
            
            {/* Clear Button (Visible only when history exists) */}
            {history.length > 0 && (
                <div className="sticky top-0 z-10 flex justify-center pb-2">
                    <button 
                        onClick={() => {
                            if (window.confirm('Are you sure you want to permanently delete all conversation history?')) {
                                clearHistory();
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/20 text-xs font-bold backdrop-blur-md hover:bg-crimson/20 transition-all"
                    >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All</span>
                    </button>
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
                      ? 'bg-gradient-to-br from-cyan-50/30 to-blue-50/70 backdrop-blur-md border border-cyan-200/30 text-clay-900 rounded-2xl rounded-tr-sm shadow-[0_4px_20px_rgba(0,0,0,0.02)]' 
                      : 'bg-white/60 backdrop-blur-sm border border-white/40 text-clay-900 rounded-2xl rounded-tl-sm shadow-sm'
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
                            ? 'bg-white/40 hover:bg-white/60 border border-white/40 text-cyan-800'
                            : 'bg-clay-200/50 hover:bg-clay-200 text-clay-600 hover:text-clay-900'
                       }`}>
                           <Volume2 className="w-3.5 h-3.5" />
                           <span>Speak</span>
                       </button>
                   </div>
                </div>
                <div className="mt-1 px-2 text-[10px] text-clay-400 font-medium opacity-80">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={dummyRef} />
          </div>
        )}

        {/* === TAB 2: ENGINE BRAIN (Terminal View) === */}
        {activeTab === 'brain' && (
           <div className="h-full flex flex-col font-mono text-xs overflow-hidden bg-clay-50/50">
              {/* Stats Header */}
              <div className="shrink-0 p-4 border-b border-clay-200 bg-white/30 flex items-center justify-between">
                 <div className="flex gap-4">
                    <div 
                        onClick={handleToggleProvider}
                        title="System Status"
                        className={`flex items-center gap-2 transition-colors select-none ${
                             adminProvider === 'gemini' ? 'text-blue-600' :
                             adminProvider === 'openai' ? 'text-emerald-600' :
                             'text-clay-600'
                        }`}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        <span className="font-bold">
                            {adminProvider ? adminProvider.toUpperCase() : 'ONLINE'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-clay-500">
                        <Database className="w-3.5 h-3.5" />
                        <span>Cache: <span className="text-clay-900 font-bold">{cacheStats?.size || 0}/{cacheStats?.max || 50}</span></span>
                    </div>
                 </div>
                 <div className="text-[10px] text-clay-400 uppercase tracking-wider font-bold">{activeModel}</div>
              </div>

              {/* Terminal Logs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-transparent scrollbar-thin scrollbar-thumb-clay-300">
                  {engineLogs.length === 0 && (
                      <div className="text-clay-400 italic mt-10 text-center">Engine standby...</div>
                  )}
                  {/* Reverse logs to show newest at bottom if we flex-col-reverse, OR just map normally and scroll to bottom */}
                  {[...engineLogs].reverse().map((log) => (
                      <div key={log.id} className="flex gap-3 text-xs leading-normal">
                          <span className="shrink-0 text-clay-400 select-none">[{log.timestamp}]</span>
                          <span className={`${
                              log.type === 'error' ? 'text-red-700 font-bold' :
                              log.type === 'success' ? 'text-emerald-700 font-medium' :
                              log.type === 'warning' ? 'text-amber-700' :
                              'text-clay-800'
                          }`}>
                              {log.type === 'info' && <span className="mr-2 opacity-50">$</span>}
                              {log.message}
                          </span>
                      </div>
                  ))}
                  <div ref={dummyRef} />
              </div>

                {/* Input Simulation (Visual only) */}
                <div className="shrink-0 p-2 bg-white/20 border-t border-clay-200">
                    <div className="flex items-center gap-2 text-clay-500 px-2">
                        <span>{'>'}</span>
                        <span className="animate-pulse bg-clay-800 w-2 h-4 block"></span>
                    </div>
                </div>
           </div>
        )}

        {/* === TAB 3: LONG TERM MEMORY === */}
        {activeTab === 'memory' && (
           <div className="h-full overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-clay-300">
               
               {/* Header / Refresh */}
               <div className="flex justify-between items-center mb-2 px-1">
                   <h3 className="text-xs font-bold text-clay-500 uppercase tracking-widest">Saved Facts</h3>
                   <div className="flex gap-2">
                        <button 
                            onClick={clearMemories}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-clay-400 hover:text-red-500 transition-all"
                            title="Wipe All Memories"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={handleRefreshMemories}
                            className={`p-1.5 rounded-lg hover:bg-clay-200 text-clay-400 hover:text-emerald-600 transition-all ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
                            title="Refresh Memories"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                   </div>
               </div>

               {(!memories || memories.length === 0) && (
                   <div className="flex flex-col items-center justify-center py-20 opacity-40 gap-3 text-clay-400">
                        <Database className="w-10 h-10 stroke-1" />
                        <p className="text-sm">No long-term memories found</p>
                   </div>
               )}
               {memories && memories.map((m) => (
                   <div key={m.id} className="p-3 rounded-2xl bg-white/60 border border-white/50 shadow-sm hover:shadow-md transition-all group">
                       <div className="flex items-start gap-3">
                           <div className="mt-1 p-1.5 rounded-lg bg-azure-500/10 text-azure-600">
                               <HardDrive className="w-3.5 h-3.5" />
                           </div>
                           <div>
                               <p className="text-sm text-clay-800 leading-relaxed font-medium">{m.text}</p>
                               <p className="text-[10px] text-clay-400 mt-2 font-mono">
                                   ID: {m.id.slice(0, 8)}... • {new Date(m.timestamp).toLocaleDateString()}
                               </p>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        )}

      </div>
    </aside>
  );
}
