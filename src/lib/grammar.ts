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
  // Signal 6: The Filter (Spelling Constraint)
  if (!currentText) return [];

  const endsWithSpace = currentText.endsWith(' ');
  const words = currentText.trim().split(/\s+/);
  
  let contextWord = ""; // The word determining grammar (e.g. "want")
  let filterPrefix = ""; // The partial typing (e.g. "p")

  if (endsWithSpace) {
      // User finished a word, waiting for next
      contextWord = words[words.length - 1].toLowerCase();
      filterPrefix = "";
  } else {
      // User is typing a word
      filterPrefix = words[words.length - 1].toLowerCase();
      contextWord = words.length > 1 ? words[words.length - 2].toLowerCase() : "";
  }

  // Collect all possible candidates based on context
  let candidates: string[] = [];

  // 1. Check Bigram Overrides for Context
  if (contextWord && BIGRAM_OVERRIDES[contextWord]) {
    candidates = BIGRAM_OVERRIDES[contextWord];
  } 
  // 2. Check POS Rules for Context
  else if (contextWord && GRAMMAR_RULES[contextWord]) {
    const targetCategories = GRAMMAR_RULES[contextWord];
    if (targetCategories.includes('verb')) candidates.push(...WORD_BANK.verbs);
    if (targetCategories.includes('noun')) candidates.push(...WORD_BANK.nouns);
    if (targetCategories.includes('adjective')) candidates.push(...WORD_BANK.adjectives);
    if (targetCategories.includes('pronoun')) candidates.push(...WORD_BANK.pronouns); // Added pronouns
  }
  // 3. No Context? Use everything
  else {
    candidates = [
      ...WORD_BANK.verbs,
      ...WORD_BANK.nouns,
      ...WORD_BANK.adjectives,
      ...WORD_BANK.pronouns,
      ...WORD_BANK.conjunctions,
      ...WORD_BANK.prepositions
    ];
  }

  // 4. APPLY SIGNAL 6: Prefix Filter
  // If we have a filter, only show matches
  if (filterPrefix) {
      candidates = candidates.filter(w => w.toLowerCase().startsWith(filterPrefix));
  }

  // 5. Deduplicate and return top 4
  const uniqueCandidates = Array.from(new Set(candidates));
  
  if (uniqueCandidates.length === 0) return [];

  return uniqueCandidates.slice(0, 4).map((word, idx) => ({
      id: `g-filter-${idx}`,
      label: word.toLowerCase(),
      text: word.toLowerCase(),
      type: 'prediction'
  }));
}
