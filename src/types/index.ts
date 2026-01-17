// src/types/index.ts

// 1. CHAT MESSAGE (For the Left Sidebar History)
export interface ChatMessage {
  id: string; // UUID
  role: 'user' | 'assistant' | 'system';
  content: string; // The displayed text
  audioUrl?: string; // If we want to replay TTS
  timestamp: string; // ISO Date String
  contextTags?: string[]; // e.g., ["Food", "Lunch"]
}

// 2. SUGGESTION RESPONSE (From Gemini -> Smart Deck)
export interface SuggestionResponse {
  id: string;
  label: string; // The BIG text on the card (e.g., "Pizza")
  text: string; // The ghost text/full sentence (e.g., "I would like a slice of pizza")
  type: 'prediction' | 'spark' | 'reply'; 
  confidence?: number; // 0-1 (For Neural Console debug)
}

// 3. USER PROFILE (For Context & Personalization)
export interface UserProfile {
  id: string;
  name: string;
  voiceId: string; // ElevenLabs Voice ID
  schedule?: {
    [time: string]: string; // e.g. "12:00": "Lunch"
  };
  facts?: string[]; // e.g. ["Allergic to Peanuts", "Likes Minecraft"]
  settings: {
    theme: 'light' | 'dark' | 'cyberdeck';
    colorMode: 'neon' | 'standard';
    inputSpeed: number; // For analytics
  };
}

// 4. SCHEDULER
export interface ScheduleItem {
  _id: string;
  label: string;
  timeBlock: 'morning' | 'afternoon' | 'evening';
  order: number;
}
