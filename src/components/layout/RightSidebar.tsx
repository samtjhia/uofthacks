import React from 'react';
import { useStore } from '@/store/useStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, MicOff, Smile, Frown, Meh, Heart, MessageCircle } from 'lucide-react';

export default function RightSidebar() {
  const { 
    isListening, toggleListening, suggestions, isPredicting, setTypedText, 
    addHistoryItem, isAutoMode, toggleAutoMode, fetchSuggestions, fetchSchedule, 
    reinforceHabit, refreshPredictions, speechTone, setSpeechTone
  } = useStore();
  
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
    <aside className="w-full h-full border-l border-white/20 bg-white/40 backdrop-blur-xl flex flex-col font-sans text-clay-900 rounded-l-3xl overflow-hidden">
      
      {/* TOP SECTION: SUGGESTED PHRASES */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 pb-6">
            <h2 className="text-xl font-bold text-clay-800 tracking-tight flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-crimson" />
                Suggestions
            </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3 scrollbar-hide">
          {isPredicting ? (
             // LOADING SKELETONS
             [1, 2, 3, 4].map(i => (
                 <div key={i} className="w-full p-4 rounded-[2rem] bg-white/40 border border-white/50 relative overflow-hidden shadow-sm">
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
                     <div className="h-4 bg-clay-200/50 rounded-full w-3/4 mb-2" />
                     <div className="h-3 bg-clay-200/30 rounded-full w-1/2" />
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
               className="w-full text-left p-4 rounded-[2rem] bg-white/40 hover:bg-white/80 border border-white/60 hover:border-white transition-all group relative overflow-hidden shadow-sm hover:shadow-md"
             >
                {/* Subtle highlight effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-crimson/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="relative z-10 p-1">
                 <div className="font-medium text-[15px] leading-snug text-clay-800 group-hover:text-crimson transition-colors">
                   {sug.text}
                 </div>
               </div>
             </button>
          )))}
        </div>
      </div>


      {/* BOTTOM SECTION: CONTROLS */}
      <div className="flex-none p-6 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-clay-300/50 to-transparent"></div>

        {/* LISTENER BUTTON - Centerpiece */}
        <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-xs font-bold text-clay-400 uppercase tracking-widest mb-4">
                {isListening ? 'Listening...' : 'Tap to Listen'}
            </span>
            
          <button
            onClick={(e) => { e.currentTarget.blur(); handleManualStop(); }}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 ${
              isListening
                ? 'bg-crimson text-white border-crimson/30 shadow-[0_0_40px_rgba(220,10,10,0.4)] animate-pulse'
                : 'bg-clay-100 text-clay-400 border-white hover:bg-white hover:text-crimson hover:border-crimson/10 shadow-sm hover:shadow-lg hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
          
           {/* Auto Mode Toggle */}
           <div className="mt-6 flex items-center gap-3 bg-white/30 px-4 py-2 rounded-full border border-white/40">
             <span className={`text-[10px] font-bold tracking-wider ${isAutoMode ? 'text-crimson' : 'text-clay-400'}`}>
                {isAutoMode ? 'AUTO LOOP (ON)' : 'AUTO LOOP (OFF)'}
             </span>
             <button
               onClick={(e) => { e.currentTarget.blur(); handleToggleAutoMode(); }}
               className={`w-10 h-5 rounded-full relative transition-colors ${
                 isAutoMode ? 'bg-crimson/20' : 'bg-clay-300'
               }`}
             >
               <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${
                 isAutoMode ? 'left-6 bg-crimson' : 'left-1'
               }`} />
             </button>
           </div>
        </div>

        {/* TONE SELECTOR */}
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-4 border border-white/60 shadow-sm">
          <label className="block text-[10px] text-clay-400 font-bold uppercase tracking-widest mb-3 text-center">Response Tone</label>
          <div className="flex justify-between items-center px-2">
            {[
              { icon: Meh, label: "neutral", display: "Neutral", color: 'text-clay-600' },
              { icon: Smile, label: "happy", display: "Happy", color: 'text-amber-500' },
              { icon: Frown, label: "serious", display: "Serious", color: 'text-blue-500' },
              { icon: Heart, label: "empathic", display: "Empath", color: 'text-crimson' }
            ].map((tone, idx) => {
              // @ts-ignore
              const isActive = speechTone === tone.label;
              return (
              <button 
                key={idx} 
                // @ts-ignore
                onClick={(e) => { 
                    setSpeechTone(tone.label as any);
                    e.currentTarget.blur();
                }}
                className="group flex flex-col items-center gap-1.5"
                title={tone.display}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 border ${
                    isActive 
                    ? 'bg-white shadow-lg border-white ring-2 ring-crimson/10 scale-110' 
                    : 'bg-white/40 hover:bg-white/80 border-transparent hover:border-white'
                }`}>
                    <tone.icon className={`w-5 h-5 transition-all ${tone.color} ${isActive ? 'opacity-100' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`} />
                </div>
              </button>
            )})}
          </div>
        </div>

      </div>
    </aside>
  );
}
