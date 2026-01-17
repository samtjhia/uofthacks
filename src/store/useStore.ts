import { create } from 'zustand';
import { ChatMessage, SuggestionResponse, UserProfile } from '@/types';

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

  inputMode: 'text' | 'picture' | 'spark';
  setInputMode: (mode: 'text' | 'picture' | 'spark') => void;
  
  // Data State
  typedText: string;
  setTypedText: (text: string) => void;
  history: ChatMessage[];
  suggestions: SuggestionResponse[];
  userProfile: UserProfile | null;
  
  // Actions
  addHistoryItem: (item: ChatMessage) => Promise<void>;
  setSuggestions: (items: SuggestionResponse[]) => void;

  // Async Actions
  fetchHistory: () => Promise<void>;
  fetchSuggestions: () => Promise<void>;
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
  setInputMode: (mode) => set({ inputMode: mode }),
  
  typedText: '',
  setTypedText: (text) => set({ typedText: text }),
  
  history: [],
  suggestions: MOCK_SUGGESTIONS,
  userProfile: null,
  
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
