import mongoose, { Schema, Model } from 'mongoose';

// --- SIGNAL 4: HABIT (Frequency Engine) ---
// Tracks how often a phrase is used to rank suggestions.
interface IHabit {
  text: string;
  category: string; // e.g., 'food', 'greeting', 'general'
  usageCount: number;
  lastUsed: Date;
}

const HabitSchema = new Schema<IHabit>({
  text: { type: String, required: true, unique: true },
  category: { type: String, default: 'general' },
  usageCount: { type: Number, default: 1 },
  lastUsed: { type: Date, default: Date.now },
});

// Prevent model recompilation error in Next.js hot-reload
export const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);


// --- HISTORY LOGGING ---
// Stores the chat history for persistence.
interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
