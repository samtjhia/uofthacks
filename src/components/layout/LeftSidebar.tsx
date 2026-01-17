import React from 'react';
import { useStore, AppState } from '../../store/useStore';
import { Volume2, MessageSquare } from 'lucide-react';

export default function LeftSidebar() {
  const history = useStore((state: AppState) => state.history);

  return (
    <aside className="w-80 h-full border-r border-slate-800 bg-slate-950 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-neon-green" />
        <h2 className="font-bold text-slate-100">History</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-3 rounded-lg border ${
              msg.role === 'user' 
                ? 'bg-slate-900 border-slate-800 ml-4' 
                : 'bg-emerald-950/30 border-emerald-900/50 mr-4'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase">
                {msg.role}
              </span>
              <button className="text-slate-500 hover:text-neon-green transition-colors">
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm text-slate-200">{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        
        {/* Context Stream */}
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Context Signals</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold">Time: Lunch</span>
            <span className="px-2 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold">Loc: Kitchen</span>
          </div>
        </div>

        {/* NEURAL CONSOLE (Collapsible) */}
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-black">
          <div className="p-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
             <span className="text-[10px] font-mono text-cyan-400 uppercase">Neural Console_</span>
             <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          </div>
          <div className="p-3 font-mono text-[10px] text-slate-400 leading-relaxed overflow-x-auto">
             <div><span className="text-purple-400">confidence:</span> <span className="text-yellow-400">0.98</span></div>
             <div><span className="text-purple-400">intention:</span> <span className="text-white">"request_food"</span></div>
             <div><span className="text-purple-400">latency:</span> <span className="text-white">45ms</span></div>
             <div className="mt-2 text-slate-600">// waiting for input...</div>
          </div>
        </div>

      </div>
    </aside>
  );
}
