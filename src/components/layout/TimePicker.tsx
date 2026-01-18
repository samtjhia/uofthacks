import React, { useState, useEffect } from 'react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-white/10 text-center">
          <h2 className="text-xl font-bold text-white">Set Time & Duration</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Time Selector */}
          <div className="flex justify-center items-center gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => adjustHours(1)}
                className="w-16 h-12 bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-indigo-600 text-white flex items-center justify-center text-2xl transition-colors"
              >
                ▲
              </button>
              <div className="text-5xl font-mono text-indigo-400 font-bold w-24 text-center select-none">
                {hours.toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => adjustHours(-1)}
                className="w-16 h-12 bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-indigo-600 text-white flex items-center justify-center text-2xl transition-colors"
              >
                ▼
              </button>
            </div>

            <span className="text-5xl font-mono text-slate-500 font-bold pb-2">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => stepMinutes(5)}
                className="w-16 h-12 bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-indigo-600 text-white flex items-center justify-center text-2xl transition-colors"
              >
                ▲
              </button>
              <div className="text-5xl font-mono text-indigo-400 font-bold w-24 text-center select-none">
                {minutes.toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => stepMinutes(-5)}
                className="w-16 h-12 bg-slate-800 rounded-lg hover:bg-slate-700 active:bg-indigo-600 text-white flex items-center justify-center text-2xl transition-colors"
              >
                ▼
              </button>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Duration Selector */}
          <div>
            <div className="text-center text-slate-400 mb-3 font-medium">Duration</div>
            <div className="grid grid-cols-3 gap-3">
              {durations.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`
                    py-3 px-2 rounded-xl text-lg font-bold transition-all
                    ${duration === d 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                  `}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-800 border-t border-white/10 flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-xl text-xl font-bold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white rounded-xl text-xl font-bold shadow-lg shadow-emerald-900/50 transition-colors"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
};
