import { create } from 'zustand';
import { ChatMessage, SuggestionResponse, UserProfile, ScheduleItem } from '@/types';
import { getGrammarSuggestions } from '@/lib/grammar';

let debounceTimer: ReturnType<typeof setTimeout>;

// Simple LRU Cache for Predictions
let predictionCache = new Map<string, SuggestionResponse[]>();
const MAX_CACHE_SIZE = 200; // Increased to 200 to allow for extensive history
const PREDICTION_DEBOUNCE_MS = 300; // Fast response
const CACHE_KEY_STORAGE = 'gemini_prediction_cache_v3'; // Persists across reloads

// Load cache from localStorage (client-side only)
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(CACHE_KEY_STORAGE);
    if (saved) {
      const parsed = JSON.parse(saved);
      predictionCache = new Map(parsed);
      console.log(`🧠 Loaded ${predictionCache.size} cached predictions from disk.`);
    }
  } catch (e) {
    console.error("Failed to load prediction cache", e);
  }
}

// Helper to save cache
const saveCacheToDisk = () => {
  if (typeof window !== 'undefined') {
    try {
      // Convert Map to Array for JSON stringify
      const array = Array.from(predictionCache.entries());
      localStorage.setItem(CACHE_KEY_STORAGE, JSON.stringify(array));
    } catch (e) {
      console.error("Failed to save prediction cache", e);
    }
  }
};

export interface AppState {
  // UI State
  isListening: boolean;
  toggleListening: () => void;
  isLeftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  
  // Audio State
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  isAutoMode: boolean;
  toggleAutoMode: () => void;
  isSpeaking: boolean;
  setIsSpeaking: (isSpeaking: boolean) => void;

  inputMode: 'text' | 'picture' | 'spark' | 'schedule';
  setInputMode: (mode: 'text' | 'picture' | 'spark' | 'schedule') => void;
  
  // Data State
  typedText: string;
  setTypedText: (text: string) => void;
  history: ChatMessage[];
  suggestions: SuggestionResponse[];
  habits: string[]; // Signal 4: Top frequency words
  userProfile: UserProfile | null;
  scheduleItems: ScheduleItem[];
  schedulerAddingToBlock: 'morning' | 'afternoon' | 'evening' | null;
  setSchedulerAddingToBlock: (block: 'morning' | 'afternoon' | 'evening' | null) => void;
  
  // Debug / Engine State
  activeModel: string;
  engineLogs: { id: string, timestamp: string, message: string, type: 'info' | 'success' | 'warning' | 'error' }[];
  addEngineLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  cacheStats: { size: number, max: number };

  // Actions
  addHistoryItem: (item: ChatMessage) => Promise<void>;
  setSuggestions: (items: SuggestionResponse[]) => void;
  refreshPredictions: (textOverride?: string) => Promise<void>;

  // Async Actions
  fetchHistory: () => Promise<void>;
  fetchSuggestions: (onlySignals?: boolean) => Promise<void>;
  fetchSchedule: () => Promise<void>;
  addScheduleItem: (label: string, timeBlock: 'morning' | 'afternoon' | 'evening', startTime?: string, durationMinutes?: number) => Promise<void>;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => Promise<void>;
  deleteScheduleItem: (id: string) => Promise<void>;
  reinforceHabit: (text: string) => Promise<void>;
}

// MOCK DATA (Empty initially to trigger Defaults)
const MOCK_SUGGESTIONS: SuggestionResponse[] = [];

export const useStore = create<AppState>((set, get) => ({
  isListening: false,
  toggleListening: () => set((state) => ({ isListening: !state.isListening })),
  
  isLeftSidebarOpen: true,
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
  isRightSidebarOpen: true,
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),

  audioLevel: 0,
  setAudioLevel: (level) => set({ audioLevel: level }),
  isAutoMode: false,
  toggleAutoMode: () => set((state) => ({ isAutoMode: !state.isAutoMode })),
  isSpeaking: false,
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),

  inputMode: 'text',
  setInputMode: (mode) => set({ inputMode: mode, schedulerAddingToBlock: null }),
  
  typedText: '',
  setTypedText: (text) => {
    set({ typedText: text });
    
    // 1. Level 1: Immediate Local Grammar (Latency < 10ms)
    // Provides instant feedback so the UI doesn't feel sluggish
    get().addEngineLog(`Input: "${text}"`, 'info');
    const grammarSuggestions = getGrammarSuggestions(text);
    
    if (text.trim() !== '') {
         set({ suggestions: grammarSuggestions });
         get().addEngineLog(`Grammar: Found ${grammarSuggestions.length} local matches`, 'info');
    } else {
        set({ suggestions: [] });
    }

    // 2. Level 2: Gemini Brain (Debounced)
    // We allow empty text to trigger "Zero-Shot" predictions based on context (Schedule, Location, etc.)
    if (debounceTimer) clearTimeout(debounceTimer);

    // Call shared prediction logic
    debounceTimer = setTimeout(() => {
        get().refreshPredictions(text); // Use helper function
    }, PREDICTION_DEBOUNCE_MS);
  },

  // EXPOSED PREDICTION FUNCTION (For Manual Triggering)
  refreshPredictions: async (textOverride?: string) => {
        const text = textOverride !== undefined ? textOverride : get().typedText;
        try {
            get().addEngineLog(`⏳ Engine Activated. Reason: ${text ? 'Typing' : 'Zero-Shot Context'}...`, 'info');
            const state = get();
            
            // PREPARE SIGNALS (Early for Cache Key)
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const relevantSchedule = state.scheduleItems.map(i => `${i.timeBlock}: ${i.label}`).join(', ');

            // Get recent history for context (last 3 messages is usually enough for immediate context)
            const recentHistory = state.history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n');
            
            // FIX: Do NOT trim text. "so" (completions) and "so " (next word) are different states.
            // Cache Key now includes Schedule to differentiate contexts (e.g. Beach vs Home)
            const cacheKey = `${text}|${recentHistory}|${relevantSchedule}`; 

            // CHECK CACHE FIRST
            if (predictionCache.has(cacheKey)) {
                 // console.log("Using cached prediction for:", text);
                 get().addEngineLog(`⚡ Cache HIT. (Size: ${predictionCache.size}/${MAX_CACHE_SIZE})`, 'success');
                 set({ suggestions: predictionCache.get(cacheKey)! });
                 return;
            }

            get().addEngineLog(`💨 Cache MISS [${predictionCache.size}]. Fetching from Gemini...`, 'warning');
            console.log("⚡ Fetching new prediction from API for:", text);
            
            get().addEngineLog(`📡 Signals: Time=${timeString}, Sched=${state.scheduleItems.length}, Habits=${state.habits.length}`, 'info');

            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text, 
                    history: recentHistory,
                    // New Context Signals
                    time: timeString,
                    userProfile: state.userProfile,
                    schedule: relevantSchedule,
                    // Signal 4: Top 20 Habits
                    habits: state.habits.slice(0, 20)
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update Model Info
                if (data.model) {
                   set({ activeModel: data.model });
                }

                // Log the thought process from the API
                if (data.reasoning) {
                   get().addEngineLog(`🧠 Thought: ${data.reasoning}`, 'info');
                }

                if (data.suggestions && Array.isArray(data.suggestions)) {
                    // Update Store
                    set({ suggestions: data.suggestions });
                    
                    // Update Cache
                    if (predictionCache.size >= MAX_CACHE_SIZE) {
                        const firstKey = predictionCache.keys().next().value;
                        if (firstKey) predictionCache.delete(firstKey);
                    }
                    predictionCache.set(cacheKey, data.suggestions);
                    set({ cacheStats: { size: predictionCache.size, max: MAX_CACHE_SIZE } });
                    get().addEngineLog(`✅ ${data.model || 'AI'}: Returned ${data.suggestions.length} predictions`, 'success');
                    saveCacheToDisk(); // Persist to localStorage
                }
            }
        } catch (error) {
            console.error("Gemini Prediction Failed:", error);
            get().addEngineLog(`❌ Engine Error: ${error}`, 'error');
            // Fail silently, keeping the Grammar suggestions
        }
  },
  
  history: [],
  suggestions: MOCK_SUGGESTIONS,
  habits: [],
  userProfile: null,
  scheduleItems: [],
  schedulerAddingToBlock: null,
  setSchedulerAddingToBlock: (block) => set({ schedulerAddingToBlock: block }),
  
  activeModel: 'Offline',
  engineLogs: [],
  cacheStats: { size: predictionCache.size, max: MAX_CACHE_SIZE },
  addEngineLog: (message, type = 'info') => set(state => ({ 
      engineLogs: [
          { id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toLocaleTimeString(), message, type },
          ...state.engineLogs
      ].slice(0, 50) // Keep last 50 logs
  })),

  addHistoryItem: async (item) => {
    // Optimistic update
    set((state) => ({ history: [...state.history, item] }));
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: item.role, content: item.content }),
      });
    } catch (error) {
      console.error('Failed to save history item:', error);
    }
  },

  setSuggestions: (items) => set({ suggestions: items }),

  fetchHistory: async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        // Map DB response to ChatMessage
        const history = data.map((msg: any) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }));
        set({ history });
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  },

  fetchSuggestions: async (onlySignals = false) => {
    try {
      const res = await fetch('/api/frequency');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Store pure strings for sending to Gemini as "Habits"
          const habitStrings = data.map((h:any) => h.text);
          
          if (!onlySignals) {
              const suggestions = data.map((h: any) => ({
                id: h._id,
                label: h.text.length > 15 ? h.text.substring(0, 15) + '...' : h.text,
                text: h.text,
                type: 'prediction' as const,
              }));
              set({ suggestions, habits: habitStrings });
          } else {
              // Just update habits, leave suggestions alone (presumably they are being handled by Smart Engine)
              set({ habits: habitStrings });
          }
        } else {
          if (!onlySignals) set({ suggestions: MOCK_SUGGESTIONS, habits: [] });
          else set({ habits: [] });
        }
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  },
fetchSchedule: async () => {
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) {
        const data = await res.json();
        set({ scheduleItems: data.items || [] });
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  },

  addScheduleItem: async (label, timeBlock, startTime, durationMinutes) => {
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, timeBlock, startTime, durationMinutes }),
      });
      if (res.ok) {
        // Refresh schedule
        const current = get();
        await current.fetchSchedule();
      }
    } catch (error) {
      console.error('Failed to add schedule item:', error);
    }
  },

  updateScheduleItem: async (id, updates) => {
    try {
       // Optimistic
       const current = get();
       const newItems = current.scheduleItems.map(i => i._id === id ? { ...i, ...updates } : i);
       set({ scheduleItems: newItems });

       await fetch('/api/schedule', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id, ...updates }),
       });
       // In background re-fetch to ensure consistency? Maybe later.
    } catch (error) {
      console.error('Failed to update schedule item:', error);
    }
  },

  deleteScheduleItem: async (id) => {
    try {
      await fetch(`/api/schedule?id=${id}`, {
        method: 'DELETE',
      });
      const current = get();
      // Optimistic delete
      set({ scheduleItems: current.scheduleItems.filter((i) => i._id !== id) });
    } catch (error) {
      console.error('Failed to delete schedule item:', error);
    }
  },

  
  reinforceHabit: async (text: string) => {
    try {
      await fetch('/api/frequency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
    } catch (error) {
      console.error('Failed to reinforce habit:', error);
    }
  },
}));
