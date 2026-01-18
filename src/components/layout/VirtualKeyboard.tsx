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
                  rounded-[1.5rem] font-semibold text-lg transition-all duration-200
                  ${isDel 
                    ? 'flex-[1.5] bg-crimson/10 text-crimson hover:bg-crimson hover:text-white border-crimson/20' 
                    : 'flex-1 bg-white/40 text-clay-900 hover:bg-white hover:-translate-y-1 hover:shadow-lg border-white/60'
                  }
                  active:scale-95 active:translate-y-0
                  shadow-sm border
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
            w-1/2 rounded-[2rem] bg-white/40 text-clay-600 font-bold tracking-widest uppercase text-sm
            hover:bg-white hover:text-clay-900 transition-all hover:shadow-lg
            active:scale-[0.98] border border-white/60
          "
        >
          Space
        </button>
      </div>
    </div>
  );
}

