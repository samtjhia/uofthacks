import { create } from 'zustand';
import { ChatMessage, SuggestionResponse, UserProfile, ScheduleItem } from '@/types';
import { getGrammarSuggestions } from '@/lib/grammar';

let debounceTimer: ReturnType<typeof setTimeout>;

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
  userProfile: UserProfile | null;
  scheduleItems: ScheduleItem[];
  schedulerAddingToBlock: 'morning' | 'afternoon' | 'evening' | null;
  setSchedulerAddingToBlock: (block: 'morning' | 'afternoon' | 'evening' | null) => void;
  
  // Actions
  addHistoryItem: (item: ChatMessage) => Promise<void>;
  setSuggestions: (items: SuggestionResponse[]) => void;

  // Async Actions
  fetchHistory: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  fetchSchedule: () => Promise<void>;
  addScheduleItem: (label: string, timeBlock: 'morning' | 'afternoon' | 'evening', startTime?: string, durationMinutes?: number) => Promise<void>;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => Promise<void>;
  deleteScheduleItem: (id: string) => Promise<void>;
  reinforceHabit: (text: string) => Promise<void>;
}

// MOCK DATA
const MOCK_SUGGESTIONS: SuggestionResponse[] = [
  { id: 's1', label: 'Pizza', text: 'I would like a slice of pizza', type: 'prediction' },
  { id: 's2', label: 'Pasta', text: 'Some pasta would be nice', type: 'prediction' },
  { id: 's3', label: 'Water', text: 'Can I have some water?', type: 'prediction' },
];

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
    const grammarSuggestions = getGrammarSuggestions(text);
    
    if (text.trim() !== '') {
         set({ suggestions: grammarSuggestions });
    } else {
        set({ suggestions: [] });
    }

    // 2. Level 2: Gemini Brain (Debounced 500ms)
    // Provides context-aware deep predictions
    if (debounceTimer) clearTimeout(debounceTimer);

    if (text.trim().length > 0) {
      debounceTimer = setTimeout(async () => {
        try {
            // Get recent history for context (last 5 messages)
            const recentHistory = get().history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
            
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text, 
                    history: recentHistory 
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.suggestions && Array.isArray(data.suggestions)) {
                    // Start of Hybrid Merging Strategy
                    // If Gemini returns fewer than 4, fill with grammar?
                    // For now, let Gemini take the wheel if it returns valid results.
                    set({ suggestions: data.suggestions });
                }
            }
        } catch (error) {
            console.error("Gemini Prediction Failed:", error);
            // Fail silently, keeping the Grammar suggestions
        }
      }, 300); // 300ms debounce
    }
  },
  
  history: [],
  suggestions: MOCK_SUGGESTIONS,
  userProfile: null,
  scheduleItems: [],
  schedulerAddingToBlock: null,
  setSchedulerAddingToBlock: (block) => set({ schedulerAddingToBlock: block }),
  
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

  fetchSuggestions: async () => {
    try {
      const res = await fetch('/api/frequency');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const suggestions = data.map((h: any) => ({
            id: h._id,
            label: h.text.length > 15 ? h.text.substring(0, 15) + '...' : h.text,
            text: h.text,
            type: 'prediction' as const,
          }));
          set({ suggestions });
        } else {
          set({ suggestions: MOCK_SUGGESTIONS });
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
