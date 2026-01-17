import React, { useEffect, useState } from 'react';
import { Clock, Sun, Moon, Coffee, Utensils, Tv, BookOpen, Music, Plus, Trash2, X, Check, Keyboard as KeyboardIcon, ChevronDown, Edit2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TimePicker } from './TimePicker';
import { ScheduleItem } from '@/types';

// Helper to separate logic from render
const renderEndTime = (task: ScheduleItem) => {
    if (task.endTime) return task.endTime;
    // Fallback if endTime not saved yet
    const [h, m] = (task.startTime || '00:00').split(':').map(Number);
    const totalMins = h * 60 + m + (task.durationMinutes || 30);
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};

export default function SchedulerView() {
  const { setTypedText, scheduleItems, fetchSchedule, deleteScheduleItem, setSchedulerAddingToBlock, updateScheduleItem } = useStore();
  const [currentBlock, setCurrentBlock] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [progress, setProgress] = useState(0); // 0-100% of current block
  const [currentMinutes, setCurrentMinutes] = useState(0); // For item highlighting
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(updateTimeAndProgress, 30000); // 30s updates
    updateTimeAndProgress();
    return () => clearInterval(interval);
  }, []);

  const updateTimeAndProgress = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMinutes = hour * 60 + minute;
    setCurrentMinutes(totalMinutes);

    // Determine lock and progress
    // Morning: 5:00 (300m) - 12:00 (720m) -> 420m duration
    // Afternoon: 12:00 (720m) - 17:00 (1020m) -> 300m duration
    // Evening: 17:00 (1020m) - 5:00 (300m next day) -> 720m duration

    let newBlock: 'morning' | 'afternoon' | 'evening' = 'evening';
    let blockProgress = 0;

    if (totalMinutes >= 300 && totalMinutes < 720) {
      newBlock = 'morning';
      blockProgress = ((totalMinutes - 300) / 420) * 100;
    } else if (totalMinutes >= 720 && totalMinutes < 1020) {
      newBlock = 'afternoon';
      blockProgress = ((totalMinutes - 720) / 300) * 100;
    } else {
        newBlock = 'evening';
        // Handle crossover midnight logic
        // If it's evening (>= 17:00), minutes from start is (total - 1020)
        // If it's early morning (< 5:00), minutes from start is (total + 1440 - 1020) = total + 420
        let minutesIntoBlock = 0;
        if (totalMinutes >= 1020) {
            minutesIntoBlock = totalMinutes - 1020;
        } else {
            minutesIntoBlock = totalMinutes + 420; // Time since 5pm yesterday
        }
        blockProgress = (minutesIntoBlock / 720) * 100;
    }

    setCurrentBlock(newBlock);
    setProgress(Math.min(Math.max(blockProgress, 0), 100));
  };

  const timeBlocks = [
    {
      id: 'morning' as const,
      label: 'Morning',
      timeRange: '5:00 AM - 12:00 PM',
      icon: <Sun className="w-5 h-5 text-amber-400" />,
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-100',
      activeBorder: 'ring-2 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]',
      barColor: 'bg-amber-400'
    },
    {
      id: 'afternoon' as const,
      label: 'Afternoon',
      timeRange: '12:00 PM - 5:00 PM',
      icon: <Sun className="w-5 h-5 text-orange-400" />,
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-100',
      activeBorder: 'ring-2 ring-orange-400 shadow-[0_0_30px_rgba(251,146,60,0.3)]',
      barColor: 'bg-orange-400'
    },
    {
      id: 'evening' as const,
      label: 'Evening',
      timeRange: '5:00 PM - 5:00 AM',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
      color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100',
      activeBorder: 'ring-2 ring-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.3)]',
      barColor: 'bg-indigo-400'
    }
  ];

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {timeBlocks.map((block) => {
          const isActive = currentBlock === block.id;
          
          // Re-sort every render to ensure consistency
          const items = [...scheduleItems] // Create copy to avoid mutating store if using immer
            .filter(i => i.timeBlock === block.id)
            .sort((a, b) => {
               // Strict time sorting
               if (a.startTime && b.startTime) {
                 return a.startTime.localeCompare(b.startTime);
               } 
               // Items with time come first
               if (a.startTime && !b.startTime) return -1;
               if (!a.startTime && b.startTime) return 1;
               return a.order - b.order;
            });

          return (
            <div 
              key={block.id} 
              className={`rounded-3xl border flex flex-col backdrop-blur-sm transition-all duration-500 overflow-hidden ${block.color} ${isActive ? block.activeBorder : 'opacity-80 scale-95 md:scale-100 grayscale-[0.3]'}`}
            >
              
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 relative z-30 bg-inherit/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shadow-inner">
                    {block.icon}
                  </div>
                  <div>
                    <span className="font-bold text-lg block leading-tight">{block.label}</span>
                    <span className="text-xs opacity-60 font-mono tracking-wider">{block.timeRange}</span>
                  </div>
                </div>
              </div>

               {/* Timeline Container */}
              <div className="flex-1 flex flex-col min-h-0 relative">
                  
                  {/* Active Progress Line */}
                  {isActive && (
                    <div 
                       className="absolute left-0 right-0 h-0.5 z-20 pointer-events-none transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor]"
                       style={{ 
                         top: `${progress}%`,
                         backgroundColor: 'currentColor',
                         color: block.id === 'morning' ? '#fbbf24' : block.id === 'afternoon' ? '#fb923c' : '#818cf8'
                       }}
                    >
                        <div className="absolute right-2 -top-3 text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-md border border-white/10 text-white">
                            NOW
                        </div>
                        <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-white shadow-md" />
                    </div>
                  )}

                  {/* List */}
                  <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto scrollbar-hide relative z-10">
                    {/* Empty State */}
                    {items.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-4">
                            <Clock className="w-8 h-8 mb-2" />
                            <span className="text-sm">No activities planned</span>
                        </div>
                    )}

                    {items.map((task) => {
                      const isNow = task.startTime && (() => {
                          const [h, m] = task.startTime.split(':').map(Number);
                          const start = h * 60 + m;
                          const end = start + (task.durationMinutes || 30);
                          return currentMinutes >= start && currentMinutes < end;
                      })();

                      return (
                      <div key={task._id} className="group relative shrink-0">
                        <button
                          onClick={() => setTypedText(task.label)}
                          className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center gap-3 pr-10
                            ${isNow 
                              ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]'
                            }
                          `}
                        >
                            {task.startTime ? (
                               <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItem(task);
                                  }}
                                  className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg border min-w-[5rem] shrink-0 cursor-pointer hover:bg-white/10 transition-colors
                                    ${isNow ? 'bg-emerald-900/40 border-emerald-500/30' : 'bg-black/20 border-white/5'}
                                  `}
                               >
                                 <span className={`text-sm font-bold font-mono ${isNow ? 'text-emerald-300' : 'text-sky-300'}`}>{task.startTime}</span>
                                 <span className={`text-[10px] font-mono ${isNow ? 'text-emerald-400/60' : 'text-slate-500'}`}>
                                   - {renderEndTime(task)}
                                 </span>
                               </div>
                            ) : (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setEditingItem(task);
                                 }}
                                 className="flex flex-col items-center justify-center px-2 py-1 rounded-lg border border-dashed border-white/20 min-w-[5rem] shrink-0 cursor-pointer hover:bg-white/10 hover:border-white/40 transition-colors group/time"
                               >
                                  <span className="text-[10px] font-bold uppercase text-white/40 group-hover/time:text-white/80">Set Time</span>
                               </button>
                            )}
                            <span className={`font-medium text-lg leading-snug truncate w-full ${isNow ? 'text-emerald-100' : ''}`}>{task.label}</span>
                            
                            {isNow && <span className="absolute right-12 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded animate-pulse">Now</span>}
                        </button>
                        
                        {/* Delete Button (Visible on Hover) */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItem(task);
                              }}
                              className="p-2 text-white/20 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all"
                          >
                              <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScheduleItem(task._id);
                              }}
                              className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ); })}
                  </div>
              </div>
              
              {/* Footer: Add Button */}
              <div className="p-3 pt-0 shrink-0 relative z-30">
                <button 
                    onClick={() => {
                        setSchedulerAddingToBlock(block.id);
                        setTypedText(''); // Clear for new entry
                    }}
                    className="w-full p-3 rounded-2xl border-2 border-dashed border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                     <Plus className="w-5 h-5" />
                     <span className="font-medium">Add Activity</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingItem && (
        <TimePicker 
          initialTime={editingItem.startTime || '12:00'}
          initialDuration={editingItem.durationMinutes || 30}
          onConfirm={(time, duration) => {
            updateScheduleItem(editingItem._id, { startTime: time, durationMinutes: duration });
            setEditingItem(null);
          }}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}

