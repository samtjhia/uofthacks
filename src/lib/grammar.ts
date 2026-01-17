// src/lib/grammar.ts
import { SuggestionResponse } from '@/types';

type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'pronoun' | 'conjunction' | 'preposition';

interface WordBank {
  nouns: string[];
  verbs: string[];
  adjectives: string[];
  pronouns: string[];
  conjunctions: string[];
  prepositions: string[];
}

const WORD_BANK: WordBank = {
  nouns: [
    "Water", "Food", "Bathroom", "Home", "Help", "Time", "Pain", "Music", "TV",
    "Mom", "Dad", "Friend", "Doctor", "Something", "Everything", "Phone", "Book"
  ],
  verbs: [
    "Want", "Need", "Feel", "Go", "Like", "See", "Have", "Eat", "Drink", "Sleep", "Stop", "Help"
  ],
  adjectives: [
    "Good", "Bad", "Happy", "Sad", "Hungry", "Thirsty", "Tired", "Sick", "Cold", "Hot", "Loud"
  ],
  pronouns: [
    "I", "You", "It", "We", "They", "Me", "My"
  ],
  conjunctions: [
    "And", "But", "Because", "Or"
  ],
  prepositions: [
    "To", "In", "On", "For", "With", "At"
  ]
};

// Simple rules mapping: Last Word (lowercase) -> Next Likely Categories
// Default fallback is Nouns + Pronouns
const GRAMMAR_RULES: Record<string, PartOfSpeech[]> = {
  "i": ['verb'], // I want...
  "you": ['verb'], // You are/look...
  "we": ['verb'],
  "they": ['verb'],
  
  "the": ['noun', 'adjective'], // The [good] [dog]
  "a": ['noun', 'adjective'],
  "an": ['noun', 'adjective'],
  "my": ['noun'], // My [head]
  "your": ['noun'],
  
  "want": ['noun', 'verb'], // Want [water] / Want [to go] -> handled by specific words maybe?
  "need": ['noun', 'verb'],
  "like": ['noun', 'verb'],
  
  "to": ['verb', 'noun'], // To [go] / To [store] (noun as location)
  "for": ['noun', 'pronoun'], // For [me] / For [dinner]
  "with": ['noun', 'pronoun'], // With [you]
  
  "is": ['adjective', 'noun'], // It is [cold]
  "am": ['adjective', 'noun'], // I am [hungry]
  "are": ['adjective', 'noun'],
};

// Specific bigrams overrides
const BIGRAM_OVERRIDES: Record<string, string[]> = {
  "want": ["to", "some", "water", "food"],
  "need": ["to", "help", "medicine", "rest"],
  "go": ["to", "home", "outside", "bathroom"],
  "feel": ["good", "bad", "sick", "happy", "tired"],
  "eat": ["food", "breakfast", "lunch", "dinner", "snack"],
  "drink": ["water", "juice", "tea", "coffee"],
};

export function getGrammarSuggestions(currentText: string): SuggestionResponse[] {
  const words = currentText.trim().split(/\s+/);
  const lastWord = words.length > 0 ? words[words.length - 1].toLowerCase() : "";

  // 1. Check Bigram Overrides first (Special common pairs)
  if (BIGRAM_OVERRIDES[lastWord]) {
    return BIGRAM_OVERRIDES[lastWord].map((word, idx) => ({
      id: `g-${lastWord}-${idx}`,
      label: word,
      text: word,
      type: 'prediction'
    }));
  }

  // 2. Check POS Rules
  const targetCategories = GRAMMAR_RULES[lastWord];
  
  if (targetCategories) {
    let candidates: string[] = [];
    if (targetCategories.includes('verb')) candidates.push(...WORD_BANK.verbs);
    if (targetCategories.includes('noun')) candidates.push(...WORD_BANK.nouns);
    if (targetCategories.includes('adjective')) candidates.push(...WORD_BANK.adjectives);
    
    // Shuffle or select top 4
    return candidates.slice(0, 4).map((word, idx) => ({
      id: `g-pos-${idx}`,
      label: word,
      text: word,
      type: 'prediction'
    }));
  }

  // 3. Fallback / Start of Sentence
  if (currentText.trim() === "") {
     // Return empty array to signal Cockpit to use DEFAULTS (Yes, No, Help...)
     return [];
  }

  // 4. Generic Fallback (Context unknown) -> Mix of common connectors and nouns
  return [
    ...WORD_BANK.conjunctions.slice(0, 1),
    ...WORD_BANK.prepositions.slice(0, 1),
    ...WORD_BANK.nouns.slice(0, 2)
  ].map((word, idx) => ({
      id: `g-fallback-${idx}`,
      label: word,
      text: word,
      type: 'prediction'
    }));
}
