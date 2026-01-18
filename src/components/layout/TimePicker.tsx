import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimePickerProps {
  initialTime?: string; // "HH:MM" 24h format
  initialDuration?: number; // minutes
  onConfirm: (time: string, duration: number) => void;
  onCancel: () => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  initialTime,
  initialDuration = 30,
  onConfirm,
  onCancel
}) => {
  const [hours, setHours] = useState(() => {
    if (initialTime) return parseInt(initialTime.split(':')[0]) || 12;
    return new Date().getHours();
  });
  const [minutes, setMinutes] = useState(() => {
    if (initialTime) return parseInt(initialTime.split(':')[1]) || 0;
    return new Date().getMinutes();
  });
  const [duration, setDuration] = useState(initialDuration);

  // Time manipulation helpers
  const adjustHours = (delta: number) => {
    setHours(h => {
      let next = h + delta;
      if (next > 23) next = 0;
      if (next < 0) next = 23;
      return next;
    });
  };

  const adjustMinutes = (delta: number) => {
    setMinutes(m => {
      let next = m + delta;
      if (next > 55) next = 0;
      if (next < 0) next = 55; // simple 5 minute steps would check % 60
      return next;
    });
  };

  // Only allow 5 minute steps for simpler UI for minutes
  const stepMinutes = (delta: number) => {
    setMinutes(m => {
      let next = m + delta;
      if (next >= 60) next = 0;
      if (next < 0) next = 55;
      return next;
    });
  };

  const durations = [15, 30, 45, 60, 90, 120];

  const handleConfirm = () => {
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onConfirm(timeStr, duration);
  };
  
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-clay-900/40 backdrop-blur-md p-4">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-black/5 text-center">
          <h2 className="text-2xl font-bold text-clay-900">Set Time & Duration</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Time Selector */}
          <div className="flex justify-center items-center gap-6">
            {/* Hours */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => adjustHours(1)}
                className="w-16 h-12 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md hover:bg-clay-50 active:bg-crimson active:text-white active:border-crimson text-clay-900 flex items-center justify-center text-2xl transition-all"
              >
                <ChevronUp className="w-8 h-8" />
              </button>
              <div className="text-6xl font-mono text-crimson font-bold w-32 text-center select-none tracking-tighter">
                {hours.toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => adjustHours(-1)}
                className="w-16 h-12 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md hover:bg-clay-50 active:bg-crimson active:text-white active:border-crimson text-clay-900 flex items-center justify-center text-2xl transition-all"
              >
                <ChevronDown className="w-8 h-8" />
              </button>
            </div>

            <span className="text-5xl font-mono text-clay-300 font-bold pb-2">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => stepMinutes(5)}
                className="w-16 h-12 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md hover:bg-clay-50 active:bg-crimson active:text-white active:border-crimson text-clay-900 flex items-center justify-center text-2xl transition-all"
              >
                <ChevronUp className="w-8 h-8" />
              </button>
              <div className="text-6xl font-mono text-crimson font-bold w-32 text-center select-none tracking-tighter">
                {minutes.toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => stepMinutes(-5)}
                className="w-16 h-12 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md hover:bg-clay-50 active:bg-crimson active:text-white active:border-crimson text-clay-900 flex items-center justify-center text-2xl transition-all"
              >
                <ChevronDown className="w-8 h-8" />
              </button>
            </div>
          </div>

          <div className="h-px bg-black/5 w-full" />

          {/* Duration Selector */}
          <div>
            <div className="text-center text-clay-500 mb-4 font-bold uppercase tracking-wider text-sm">Duration</div>
            <div className="grid grid-cols-3 gap-4">
              {durations.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`
                    py-4 px-2 rounded-2xl text-lg font-bold transition-all border
                    ${duration === d 
                      ? 'bg-crimson text-white shadow-lg shadow-crimson/30 scale-105 border-crimson' 
                      : 'bg-white text-clay-600 border-black/5 hover:bg-clay-50 hover:shadow-md'}
                  `}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-black/5 flex gap-4 bg-white/50">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 bg-white border border-black/5 hover:bg-clay-50 active:bg-clay-100 text-clay-600 rounded-[2rem] text-xl font-bold transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white rounded-[2rem] text-xl font-bold shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
