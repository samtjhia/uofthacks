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

  inputMode: 'text' | 'picture' | 'spark';
  setInputMode: (mode: 'text' | 'picture' | 'spark') => void;
  // Picture/category UI
  pictureCategory: string | null;
  setPictureCategory: (cat: string | null) => void;
  
  // Custom Items (Infinite Icon)
  customItems: Array<{ id: string; label: string; category: string; image: string }>;
  addCustomItem: (item: { id: string; label: string; category: string; image: string }) => void;
  setCustomItems: (items: Array<{ id: string; label: string; category: string; image: string }>) => void;
  removeCustomItem: (id: string) => void;

  // Data State
  typedText: string;
  setTypedText: (text: string) => void;
  history: ChatMessage[];
  suggestions: SuggestionResponse[];
  userProfile: UserProfile | null;
  
  // Actions
  addHistoryItem: (item: ChatMessage) => void;
  setSuggestions: (items: SuggestionResponse[]) => void;
}

// MOCK DATA
const MOCK_HISTORY: ChatMessage[] = [
  { id: '1', role: 'assistant', content: 'Good morning, Sam.', timestamp: new Date().toISOString() },
  { id: '2', role: 'user', content: 'I want coffee.', timestamp: new Date().toISOString() },
];

const MOCK_SUGGESTIONS: SuggestionResponse[] = [
  { id: 's1', label: 'Pizza', text: 'I would like a slice of pizza', type: 'prediction' },
  { id: 's2', label: 'Pasta', text: 'Some pasta would be nice', type: 'prediction' },
  { id: 's3', label: 'Water', text: 'Can I have some water?', type: 'prediction' },
];

export const useStore = create<AppState>((set) => ({
  isListening: false,
  toggleListening: () => set((state) => ({ isListening: !state.isListening })),
  
  isLeftSidebarOpen: true,
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
  isRightSidebarOpen: true,
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),

  inputMode: 'text',
  setInputMode: (mode) => set({ inputMode: mode }),
  
  typedText: '',
  setTypedText: (text) => set({ typedText: text }),
  pictureCategory: null,
  setPictureCategory: (cat) => set({ pictureCategory: cat }),
  
  history: MOCK_HISTORY,
  suggestions: MOCK_SUGGESTIONS,
  userProfile: null,
  
  addHistoryItem: (item) => set((state) => ({ history: [...state.history, item] })),
  setSuggestions: (items) => set({ suggestions: items }),
  
  customItems: [],
  addCustomItem: (item) => set((state) => ({ customItems: [...state.customItems, item] })),
  setCustomItems: (items) => set({ customItems: items }),
  removeCustomItem: (id) => set((state) => ({ customItems: state.customItems.filter(i => i.id !== id) })),
}));
