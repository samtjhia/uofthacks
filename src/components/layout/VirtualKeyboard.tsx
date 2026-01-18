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
                  rounded-[1.2rem] font-semibold text-xl transition-all duration-200
                  ${isDel 
                    ? 'flex-[1.5] bg-crimson/10 text-crimson hover:bg-crimson hover:text-white' 
                    : 'flex-1 bg-white text-clay-900 hover:bg-clay-50 hover:-translate-y-1 hover:shadow-lg hover:shadow-clay-500/10'
                  }
                  active:scale-95 active:translate-y-0
                  shadow-sm border border-white
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
            w-1/2 rounded-[1.2rem] bg-white text-clay-400 font-bold tracking-widest uppercase text-xs
            hover:bg-clay-50 hover:text-clay-900 transition-all hover:shadow-lg hover:shadow-clay-500/10
            active:scale-[0.98] border border-white shadow-sm
          "
        >
          Space
        </button>
      </div>
    </div>
  );
}

