import React from 'react';

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
}

export default function VirtualKeyboard({ onKeyPress }: VirtualKeyboardProps) {
  return (
    <div className="w-full h-full flex flex-col gap-2 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
      {KEYS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-1 gap-2 justify-center">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={`
                h-14 font-mono font-bold text-xl rounded-lg transition-all active:scale-95
                ${key === 'DEL' 
                  ? 'flex-[1.5] bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40' 
                  : 'flex-1 bg-slate-800 border-b-4 border-slate-950 text-slate-200 hover:bg-slate-700 hover:border-neon-green/50 active:border-b-0 active:translate-y-1'
                }
              `}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      
      {/* SPACE BAR ROW */}
      <div className="flex gap-2 justify-center mt-1">
        <button 
          onClick={() => onKeyPress('SPACE')}
          className="w-1/2 h-14 rounded-lg bg-slate-800 border-b-4 border-slate-950 hover:bg-slate-700 active:border-b-0 active:translate-y-1 text-slate-400 font-bold"
        >
          SPACE
        </button>
      </div>
    </div>
  );
}
