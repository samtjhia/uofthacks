import React, { useState, useEffect } from 'react';

interface TimePickerProps {
  initialTime?: string; // "HH:MM" 24h format
  initialDuration?: number; // minutes
  onConfirm: (time: string, duration: number) => void;
  onCancel: () => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  initialTime = "12:00",
  initialDuration = 30,
  onConfirm,
  onCancel
}) => {
  const [hours, setHours] = useState(parseInt(initialTime.split(':')[0]) || 12);
  const [minutes, setMinutes] = useState(parseInt(initialTime.split(':')[1]) || 0);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-clay-900/40 backdrop-blur-md p-4">
      <div className="bg-white border border-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-clay-100 text-center">
          <h2 className="text-xl font-bold text-clay-900">Set Time & Duration</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white/50">
          
          {/* Time Selector */}
          <div className="flex justify-center items-center gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => adjustHours(1)}
                className="w-16 h-12 bg-clay-100 rounded-[1rem] hover:bg-clay-200 active:bg-crimson active:text-white text-clay-900 flex items-center justify-center text-3xl transition-colors pb-1"
              >
                ▴
              </button>
              <div className="text-6xl font-mono text-clay-900 font-bold w-24 text-center select-none tracking-tighter">
                {hours.toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => adjustHours(-1)}
                className="w-16 h-12 bg-clay-100 rounded-[1rem] hover:bg-clay-200 active:bg-crimson active:text-white text-clay-900 flex items-center justify-center text-3xl transition-colors pb-2"
              >
                ▾
              </button>
            </div>

            <span className="text-6xl font-mono text-clay-300 font-bold pb-2 relative -top-1">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => stepMinutes(5)}
                className="w-16 h-12 bg-clay-100 rounded-[1rem] hover:bg-clay-200 active:bg-crimson active:text-white text-clay-900 flex items-center justify-center text-3xl transition-colors pb-1"
              >
                ▴
              </button>
              <div className="text-6xl font-mono text-clay-900 font-bold w-24 text-center select-none tracking-tighter">
                {minutes.toString().padStart(2, '0')}
              </div>
              <button 
                onClick={() => stepMinutes(-5)}
                className="w-16 h-12 bg-clay-100 rounded-[1rem] hover:bg-clay-200 active:bg-crimson active:text-white text-clay-900 flex items-center justify-center text-3xl transition-colors pb-2"
              >
                ▾
              </button>
            </div>
          </div>

          <div className="h-px bg-clay-100 w-full" />

          {/* Duration Selector */}
          <div>
            <div className="text-center text-clay-400 mb-4 font-bold uppercase tracking-wider text-sm">Duration</div>
            <div className="grid grid-cols-3 gap-3">
              {durations.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`
                    py-4 px-2 rounded-[1.2rem] text-lg font-bold transition-all
                    ${duration === d 
                      ? 'bg-crimson text-white shadow-lg shadow-crimson/30 scale-105' 
                      : 'bg-clay-100 text-clay-500 hover:bg-clay-200'}
                  `}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-white border-t border-clay-100 flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 bg-clay-100 hover:bg-clay-200 active:bg-clay-300 text-clay-700 rounded-[1.2rem] text-xl font-bold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white rounded-[1.2rem] text-xl font-bold shadow-xl shadow-emerald-500/20 transition-colors"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
};
