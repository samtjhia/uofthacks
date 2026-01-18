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
      icon: <Sun className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50/80 border-amber-200 text-amber-900',
      activeBorder: 'ring-4 ring-amber-400/30 shadow-xl scale-[1.02] z-10',
      barColor: 'bg-amber-400'
    },
    {
      id: 'afternoon' as const,
      label: 'Afternoon',
      timeRange: '12:00 PM - 5:00 PM',
      icon: <Sun className="w-5 h-5 text-orange-600" />,
      color: 'bg-orange-50/80 border-orange-200 text-orange-900',
      activeBorder: 'ring-4 ring-orange-400/30 shadow-xl scale-[1.02] z-10',
      barColor: 'bg-orange-400'
    },
    {
      id: 'evening' as const,
      label: 'Evening',
      timeRange: '5:00 PM - 5:00 AM',
      icon: <Moon className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
      activeBorder: 'ring-4 ring-indigo-400/30 shadow-xl scale-[1.02] z-10',
      barColor: 'bg-indigo-400'
    }
  ];

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {timeBlocks.map((block) => {
          const isActive = currentBlock === block.id;
          
          // Re-sort every render to ensure consistency
          const items = [...scheduleItems] 
            .filter(i => i.timeBlock === block.id)
            .sort((a, b) => {
               if (a.startTime && b.startTime) {
                 return a.startTime.localeCompare(b.startTime);
               } 
               if (a.startTime && !b.startTime) return -1;
               if (!a.startTime && b.startTime) return 1;
               return a.order - b.order;
            });

          return (
            <div 
              key={block.id} 
              className={`rounded-[1.5rem] border flex flex-col backdrop-blur-xl transition-all duration-500 overflow-hidden shadow-sm ${block.color} ${isActive ? block.activeBorder : 'opacity-70 scale-95 grayscale-[0.2]'}`}
            >
              
              {/* Header */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between shrink-0 relative z-30 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {block.icon}
                  </div>
                  <div>
                    <span className="font-bold text-xl block leading-tight tracking-tight">{block.label}</span>
                    <span className="text-xs opacity-60 font-mono tracking-wider font-semibold">{block.timeRange}</span>
                  </div>
                </div>
              </div>

               {/* Timeline Container */}
              <div className="flex-1 flex flex-col min-h-0 relative">
                  
                  {/* Active Progress Line */}
                  {isActive && (
                    <div 
                       className="absolute left-0 right-0 h-0.5 z-20 pointer-events-none transition-all duration-1000 ease-linear"
                       style={{ 
                         top: `${progress}%`,
                         backgroundColor: block.id === 'morning' ? '#fbbf24' : block.id === 'afternoon' ? '#fb923c' : '#818cf8',
                       }}
                    >
                        <div className="absolute right-2 -top-3 text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded-full backdrop-blur-md text-white shadow-sm">
                            NOW
                        </div>
                        <div className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-inherit shadow-md" style={{borderColor: 'inherit'}} />
                    </div>
                  )}

                  {/* List */}
                  <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto scrollbar-hide relative z-10">
                    {/* Empty State */}
                    {items.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center p-4">
                            <Clock className="w-10 h-10 mb-3" />
                            <span className="text-sm font-medium">No activities planned</span>
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
                          className={`w-full p-4 rounded-3xl border transition-all text-left flex items-center gap-4 pr-12 shadow-sm
                            ${isNow 
                              ? 'bg-emerald-100 border-emerald-200 shadow-md ring-2 ring-emerald-400/20' 
                              : 'bg-white/60 border-white/50 hover:bg-white hover:shadow-md hover:scale-[1.01]'
                            }
                          `}
                        >
                            {task.startTime ? (
                               <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItem(task);
                                  }}
                                  className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border min-w-[5.5rem] shrink-0 cursor-pointer transition-colors
                                    ${isNow ? 'bg-white/50 border-emerald-300' : 'bg-white/40 border-black/5 hover:bg-white/80'}
                                  `}
                               >
                                 <span className={`text-base font-bold font-mono tracking-tighter ${isNow ? 'text-emerald-700' : 'text-clay-900'}`}>{task.startTime}</span>
                                 <span className={`text-[10px] font-bold font-mono ${isNow ? 'text-emerald-600/70' : 'text-clay-400'}`}>
                                   - {renderEndTime(task)}
                                 </span>
                               </div>
                            ) : (
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setEditingItem(task);
                                 }}
                                 className="flex flex-col items-center justify-center px-2 py-1.5 rounded-xl border border-dashed border-black/20 min-w-[5.5rem] shrink-0 cursor-pointer hover:bg-white/40 hover:border-black/40 transition-colors group/time"
                               >
                                  <span className="text-[10px] font-bold uppercase text-clay-400 group-hover/time:text-clay-600">Set Time</span>
                               </button>
                            )}
                            <span className={`font-bold text-lg leading-snug truncate flex-1 text-left ${isNow ? 'text-emerald-900' : 'text-clay-800'}`}>{task.label}</span>
                        </button>
                        
                        {/* Delete/Edit Buttons (Visible on Hover) */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItem(task);
                              }}
                              className="p-2 text-clay-400 hover:text-azure-600 hover:bg-azure-100 rounded-full transition-all"
                          >
                              <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScheduleItem(task._id);
                              }}
                              className="p-2 text-clay-400 hover:text-crimson hover:bg-crimson/10 rounded-full transition-all"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ); })}
                  </div>
              </div>
              
              {/* Footer: Add Button */}
              <div className="p-4 pt-0 shrink-0 relative z-30">
                <button 
                    onClick={() => {
                        setSchedulerAddingToBlock(block.id);
                        setTypedText(''); // Clear for new entry
                    }}
                    className="w-full p-4 rounded-[2rem] border-2 border-dashed border-black/10 text-black/30 hover:text-clay-600 hover:border-clay-400/50 hover:bg-white/40 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wide text-xs"
                >
                     <Plus className="w-5 h-5" />
                     <span>Add Activity</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingItem && (
        <TimePicker 
          initialTime={editingItem.startTime}
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

