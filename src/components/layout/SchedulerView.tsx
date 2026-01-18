import React, { useEffect, useState } from 'react';
import { Clock, Sun, Moon, Plus, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TimePicker } from './TimePicker';
import { ScheduleItem } from '@/types';

interface LayoutItem extends ScheduleItem {
  _start: number;
  _end: number;
  style: { top: string; height: string; left: string; width: string; zIndex: number };
}

const getMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

// Layout Algorithm: Places events on a timeline, handling vertical splits for overlaps
const layoutSchedule = (items: ScheduleItem[], blockStart: number, blockDuration: number): { scheduled: LayoutItem[], unscheduled: ScheduleItem[] } => {
    // 1. Separate items
    const scheduledRaw: (ScheduleItem & { _start: number, _end: number })[] = [];
    const unscheduled: ScheduleItem[] = [];

    items.forEach(item => {
        if (!item.startTime) {
            unscheduled.push(item);
            return;
        }

        let start = getMinutes(item.startTime);
        
        // Handle wraparound for Evening block (Starts 17:00/1020m -> Ends 5:00/300m next day)
        // If block starts late (e.g. > 12:00) and time is early (e.g. < 12:00), it's next day
        if (blockStart >= 720 && start < 600) { // 600 = 10am cushion
             start += 1440;
        }

        // Clip to block? Optional, but visual range logic
        const end = start + (item.durationMinutes || 30);
        scheduledRaw.push({ ...item, _start: start, _end: end });
    });

    scheduledRaw.sort((a,b) => a._start - b._start);

    // 2. Compute Layout (Vertical columns for overlaps)
    const styledItems: LayoutItem[] = scheduledRaw.map(item => {
        // Calculate vertical position (Time)
        // If Start < BlockStart, clamp visual top to 0? Or let it clip?
        // Let's rely on relative math.
        let relStart = item._start - blockStart;
        
        // Safety: If item is totally before block, hide it?
        // Assuming filtered by `timeBlock` before calling this.

        const top = (relStart / blockDuration) * 100;
        const height = ((item.durationMinutes || 30) / blockDuration) * 100;

        return {
            ...item,
            style: { top: `${top}%`, height: `${Math.max(height, 5)}%`, left: '0%', width: '100%', zIndex: 10 }
        };
    });

    // 3. Resolve Overlaps (Change left/width)
    // Simple greedy packing for "Split Vertically"
    // For each item, find all concurrent items (Cluster).
    // Assign "lanes".
    
    // We group by connected components of graph where edge = overlap
    const visited = new Set<string>();
    
    for (let i = 0; i < styledItems.length; i++) {
        const current = styledItems[i];
        if (visited.has(current._id)) continue;
        
        // Build Cluster
        const cluster = [current];
        visited.add(current._id);
        
        // Expand cluster? 
        // Simple approach: Find ALL items that overlap with *any* item in the cluster?
        // Simpler for this prompt: Just check overlaps with current item's timeframe? No, A->B->C chain.
        // Let's iterate all subsequent items and see if they touch existing cluster members.
        
        let changed = true;
        while (changed) {
            changed = false;
            for (let j = 0; j < styledItems.length; j++) {
                const candidate = styledItems[j];
                if (visited.has(candidate._id)) continue;
                
                // Does candidate overlap with ANY in stats?
                 const overlaps = cluster.some(m => Math.max(m._start, candidate._start) < Math.min(m._end, candidate._end));
                 if (overlaps) {
                     cluster.push(candidate);
                     visited.add(candidate._id);
                     changed = true;
                 }
            }
        }
        
        // Layout the cluster: Divide equally
        // This is what "Line Up" + "Split Vertically" usually implies in simpler UI
        // Sort by start time within cluster
        cluster.sort((a,b) => a._start - b._start);
        
        // Assign columns. 
        // This is the tricky part. "Split vertically" often means:
        // If 2 items overlap, they each get 50%.
        // If 3 items overlap, they each get 33%.
        // But A might overlap B, and neither overlap C? But they are in same cluster?
        // We will just split uniformly by max concurrency depth to be safe and clean.
        
        // 1. Calculate max simultaneous items at any point in this cluster's time range
        // Scan line algo
        const events: { t: number; type: number; id: string }[] = [];
        cluster.forEach(x => {
            events.push({t: x._start, type: 1, id: x._id});
            events.push({t: x._end, type: -1, id: x._id});
        });
        events.sort((a,b) => a.t - b.t || a.type - b.type); // process starts before ends
        
        let maxOverlap = 0;
        let running = 0;
        events.forEach(e => {
            running += e.type;
            if (running > maxOverlap) maxOverlap = running;
        });

        const width = 100 / maxOverlap;
        
        // Now assign naive column index based on sort order modulo maxOverlap? 
        // No, need to find first free slot at that time.
        const slots: number[] = new Array(maxOverlap).fill(0); // Stores 'endTime' of slot
        
        cluster.forEach(item => {
           // Find first slot that is free (slotEndTime <= itemStart)
           let slotIndex = slots.findIndex(endTime => endTime <= item._start);
           if (slotIndex === -1) slotIndex = 0; // Fallback, shouldn't happen if maxOverlap is correct
           
           slots[slotIndex] = item._end; // Occupy slot
           
           item.style.width = `calc(${width}% - 4px)`; // Gap
           item.style.left = `${slotIndex * width}%`;
        });
    }

    return { scheduled: styledItems, unscheduled };
};

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
      barColor: 'bg-amber-400',
      startMin: 300,
      duration: 420
    },
    {
      id: 'afternoon' as const,
      label: 'Afternoon',
      timeRange: '12:00 PM - 5:00 PM',
      icon: <Sun className="w-5 h-5 text-orange-600" />,
      color: 'bg-orange-50/80 border-orange-200 text-orange-900',
      activeBorder: 'ring-4 ring-orange-400/30 shadow-xl scale-[1.02] z-10',
      barColor: 'bg-orange-400',
      startMin: 720,
      duration: 300
    },
    {
      id: 'evening' as const,
      label: 'Evening',
      timeRange: '5:00 PM - 5:00 AM',
      icon: <Moon className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
      activeBorder: 'ring-4 ring-indigo-400/30 shadow-xl scale-[1.02] z-10',
      barColor: 'bg-indigo-400',
      startMin: 1020,
      duration: 720
    }
  ];


  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {timeBlocks.map((block) => {
          const isActive = currentBlock === block.id;
          
          // Layout logic
          const relevantItems = scheduleItems.filter(i => i.timeBlock === block.id);
          const { scheduled, unscheduled } = layoutSchedule(relevantItems, block.startMin, block.duration);

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
              
              {/* Unscheduled Items (Top) */}
              {unscheduled.length > 0 && (
                  <div className="px-4 pt-4 flex gap-2 overflow-x-auto pb-2 border-b border-black/5 shrink-0 z-30">
                      {unscheduled.map(task => (
                        <button
                          key={task._id}
                          onClick={() => setTypedText(task.label)}
                          className="px-3 py-2 rounded-xl bg-white/50 border border-black/5 text-sm font-bold text-clay-700 whitespace-nowrap hover:bg-white hover:shadow-sm"
                        >
                            <span className="opacity-50 mr-1">?</span>
                            {task.label}
                            <div 
                                onClick={(e) => { e.stopPropagation(); setEditingItem(task); }}
                                className="inline-flex ml-2 w-4 h-4 rounded-full bg-black/5 items-center justify-center hover:bg-crimson hover:text-white transition-colors"
                            >
                                <Edit2 className="w-2.5 h-2.5" />
                            </div>
                        </button>
                      ))}
                  </div>
              )}

               {/* Timeline Container */}
              <div className="flex-1 relative overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div className="min-h-[1200px] relative w-full shadow-inner">
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none p-4"  style={{backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 60px)'}}></div>

                    {/* Active Progress Line */}
                    {isActive && (
                        <div 
                        className="absolute left-0 right-0 h-0.5 z-40 pointer-events-none transition-all duration-1000 ease-linear"
                        style={{ 
                            top: `${progress}%`,
                            backgroundColor: block.id === 'morning' ? '#fbbf24' : block.id === 'afternoon' ? '#fb923c' : '#818cf8',
                        }}
                        >
                            <div className="absolute right-2 -top-3 text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded-full backdrop-blur-md text-white shadow-sm z-50">
                                NOW
                            </div>
                            <div className="absolute -left-1.5 -top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-inherit shadow-md z-50" style={{borderColor: 'inherit'}} />
                        </div>
                    )}

                    {/* Absolute Positioned Events */}
                    <div className="absolute inset-4 z-10">
                        {scheduled.length === 0 && unscheduled.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                <Clock className="w-10 h-10 mb-3" />
                                <span className="text-sm font-medium">Free Slot</span>
                            </div>
                        )}

                        {scheduled.map((task) => {
                        const isNow = isActive && (() => {
                            const start = task._start;
                            const end = task._end;
                            // Should map now to block time
                            let currentRel = currentMinutes;
                            if (block.id === 'evening' && currentMinutes < 1020) currentRel += 1440; // wrap logic for comparison
                            return currentRel >= start && currentRel < end;
                        })();

                        return (
                        <div 
                            key={task._id} 
                            className={`group absolute rounded-2xl border transition-all flex flex-col justify-start overflow-hidden shadow-sm hover:z-50
                                ${isNow 
                                ? 'bg-emerald-100/90 border-emerald-300 shadow-md ring-2 ring-emerald-400/20 z-20' 
                                : 'bg-white/80 border-white/50 hover:bg-white hover:shadow-lg hover:scale-[1.02]'
                                }
                            `}
                            style={task.style}
                            onClick={() => setTypedText(task.label)}
                        >
                                {/* Time Pill */}
                                <div className="absolute right-2 top-2 px-1.5 py-0.5 rounded-md bg-black/5 text-[9px] font-mono font-bold text-clay-500 backdrop-blur-sm">
                                    {task.startTime}
                                </div>

                                <div className="p-3 pr-10">
                                    <span className={`font-bold text-sm leading-tight line-clamp-2 ${isNow ? 'text-emerald-900' : 'text-clay-800'}`}>{task.label}</span>
                                    <span className="text-[10px] font-medium opacity-60 block mt-0.5">{task.durationMinutes || 30}m</span>
                                </div>
                            
                            {/* Delete/Edit Buttons (Visible on Hover) */}
                            <div className="absolute right-1 bottom-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItem(task);
                                }}
                                className="p-1.5 text-clay-400 hover:text-azure-600 hover:bg-azure-100 rounded-full transition-all"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteScheduleItem(task._id);
                                }}
                                className="p-1.5 text-clay-400 hover:text-crimson hover:bg-crimson/10 rounded-full transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                            </div>
                        </div>
                        ); })}
                        </div>
                    </div>
              </div>
              
              {/* Footer: Add Button */}
              <div className="p-4 pt-4 shrink-0 relative z-30 bg-white/40">
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

