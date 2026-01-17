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
    <div className="w-full h-full flex flex-col justify-end gap-3 pb-2">
      {KEYS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-1 gap-3 justify-center">
          {row.map((key) => {
            const isDel = key === 'DEL';
            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  relative group flex items-center justify-center
                  rounded-xl font-semibold text-lg transition-all duration-200
                  ${isDel 
                    ? 'flex-[1.5] bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white' 
                    : 'flex-1 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/20'
                  }
                  active:scale-95 active:translate-y-0
                  shadow-sm border border-slate-700/50
                `}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
      
      {/* SPACE BAR ROW */}
      <div className="flex gap-3 justify-center mt-2 h-16">
        <button 
          onClick={() => onKeyPress('SPACE')}
          className="
            w-1/2 rounded-xl bg-slate-800 text-slate-400 font-medium tracking-widest uppercase text-sm
            hover:bg-slate-700 hover:text-white transition-all hover:shadow-lg
            active:scale-[0.98] border border-slate-700/50
          "
        >
          Space
        </button>
      </div>
    </div>
  );
}

