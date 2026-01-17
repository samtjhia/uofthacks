import React from 'react';
import { useStore } from '@/store/useStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, MicOff, Smile, Frown, Meh, Heart, MessageCircle } from 'lucide-react';

export default function RightSidebar() {
  const { isListening, toggleListening, suggestions, isPredicting, setTypedText, addHistoryItem, isAutoMode, toggleAutoMode, fetchSuggestions, fetchSchedule, reinforceHabit, refreshPredictions } = useStore();
  
  React.useEffect(() => {
    // 1. Initialize Signals (Silently)
    // We want Habit data and Schedule data loaded in the store, 
    // BUT we don't want "dumb" frequency list to overwrite the UI.
    const initSignals = async () => {
        await Promise.all([
            fetchSchedule(), 
            fetchSuggestions(true) // true = load signals only, do not set UI suggestions
        ]);
        
        // 2. Trigger the "Brain" (Smart Engine)
        // Now that signals are loaded, ask Gemini to predict based on Schedule+Habits
        refreshPredictions('');
    };
    
    initSignals();
  }, [fetchSuggestions, fetchSchedule, refreshPredictions]);
  
  // Use a ref to track if we should auto-restart to avoid closure staleness
  const autoModeRef = React.useRef(isAutoMode);
  React.useEffect(() => { autoModeRef.current = isAutoMode; }, [isAutoMode]);

  // Ref to hold the startRecording function so the callback can access it
  const startRecordingRef = React.useRef<() => Promise<void>>();

  const handleRecordingFinished = React.useCallback(async (blob: Blob) => {
    if (useStore.getState().isListening) {
      toggleListening();
    }

    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');

      const response = await fetch('/api/listen', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Only add to history if it's actual speech
        const isIgnored = data.text === '[No speech detected]' || !data.text || data.text.trim().length === 0;
        
        if (!isIgnored) {
            // Add partner's speech to history
            addHistoryItem({
            id: crypto.randomUUID(),
            role: 'assistant', // Represents partner
            content: `Partner: "${data.text}"`,
            timestamp: new Date().toISOString(),
          });
        }

        // AUTO MODE: Restart recording if enabled
        if (autoModeRef.current) {
            // Tiny delay to allow UI to breathe
            setTimeout(() => {
                 startRecordingRef.current?.();
                 toggleListening();
            }, 500);
        }

      } else {
        console.error("Whisper API error:", await response.text());
      }
    } catch (err) {
      console.error("Failed to stop recording or process audio:", err);
    }
  }, [addHistoryItem, toggleListening]); // removed isAutoMode to avoid recreation

  const { startRecording, stopRecording } = useAudioRecorder(handleRecordingFinished);
  
  // Update ref when startRecording changes
  React.useEffect(() => { startRecordingRef.current = startRecording; }, [startRecording]);

  // Prevent Auto-Restart on Manual Stop?
  // If user clicks Stop, we call stopRecording -> onFinished fires -> checks AutoMode -> Restart.
  // This is an infinite loop trap.
  // Solution: If user manually toggles listening off, we should temporarily disable auto-restart 
  // OR we rely on the fact that `isListening` state is used? No.
  // We need to know 'Why' it stopped.
  // Let's rely on the user turning off "Auto Mode" switch if they want to stop fully.
  // OR: If they click the big red button, it stops AND turns off Auto Mode.
  
  const handleManualStop = async () => {
      if (isListening) {
          if (isAutoMode) toggleAutoMode(); // Disable auto if manual stop
          await stopRecording(); 
      } else {
          try {
            await startRecording();
            toggleListening();
          } catch (err) { console.error(err); }
      }
  };

  const handleToggleAutoMode = async () => {
    if (!isAutoMode) {
      // Switching ON
      toggleAutoMode();
      if (!isListening) {
        try {
          await startRecording();
          toggleListening();
        } catch (err) {
          console.error("Failed to auto-start recording:", err);
        }
      }
    } else {
      // Switching OFF
      toggleAutoMode();
      await stopRecording();
    }
  };

  return (
    <aside className="w-80 h-full border-l border-slate-700/30 bg-slate-900/80 backdrop-blur-xl flex flex-col font-sans text-slate-200">
      
      {/* TOP SECTION: SUGGESTED PHRASES */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 pb-2">
            <h2 className="text-xl font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Suggestions
            </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {isPredicting ? (
             // LOADING SKELETONS
             [1, 2, 3, 4].map(i => (
                 <div key={i} className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
                     <div className="h-4 bg-slate-700/50 rounded-full w-3/4 mb-2" />
                     <div className="h-3 bg-slate-700/30 rounded-full w-1/2" />
                 </div>
             ))
          ) : (
          suggestions.slice(0, 4).map((sug, idx) => (
             <button
               key={sug.id}
               onClick={(e) => { 
                reinforceHabit(sug.text);
                setTypedText(sug.text);
                e.currentTarget.blur();
               }}
               className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
             >
                {/* Subtle highlight effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="relative z-10 p-1">
                 <div className="font-medium text-[15px] leading-snug text-slate-200 group-hover:text-sky-300 transition-colors">
                   {sug.text}
                 </div>
               </div>
             </button>
          )))}
        </div>
      </div>


      {/* BOTTOM SECTION: CONTROLS */}
      <div className="flex-none p-6 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

        {/* LISTENER BUTTON - Centerpiece */}
        <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-4">
                {isListening ? 'Listening...' : 'Tap to Listen'}
            </span>
            
          <button
            onClick={(e) => { e.currentTarget.blur(); handleManualStop(); }}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? 'bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
          
           {/* Auto Mode Toggle */}
           <div className="mt-4 flex items-center gap-3">
             <span className={`text-xs font-semibold ${isAutoMode ? 'text-green-400' : 'text-slate-500'}`}>
                {isAutoMode ? 'AUTO LOOP ON' : 'AUTO LOOP OFF'}
             </span>
             <button
               onClick={(e) => { e.currentTarget.blur(); handleToggleAutoMode(); }}
               className={`w-12 h-6 rounded-full relative transition-colors ${
                 isAutoMode ? 'bg-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'bg-slate-700'
               }`}
             >
               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                 isAutoMode ? 'left-7 bg-green-400' : 'left-1 bg-slate-400'
               }`} />
             </button>
           </div>
        </div>

        {/* TONE SELECTOR */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 border border-white/5">
          <label className="block text-xs text-slate-400 font-medium mb-3 text-center">Response Tone</label>
          <div className="flex justify-between items-center px-2">
            {[
              { icon: Meh, label: "Neutral", color: 'text-slate-300' },
              { icon: Smile, label: "Happy", color: 'text-sky-400' },
              { icon: Frown, label: "Serious", color: 'text-indigo-400' },
              { icon: Heart, label: "Empath", color: 'text-teal-400' }
            ].map((tone, idx) => (
              <button 
                key={idx} 
                onClick={(e) => e.currentTarget.blur()}
                className="group flex flex-col items-center gap-1.5"
                title={tone.label}
              >
                <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 border border-white/5">
                    <tone.icon className={`w-5 h-5 ${tone.color} opacity-80 group-hover:opacity-100`} />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
