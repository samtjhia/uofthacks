import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SuggestionResponse } from '@/types';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { text, history, time, schedule, userProfile, habits } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Use Gemini 2.0 Flash Experimental for maximum speed
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Construct Signal-Rich Prompt
    let systemContext = `Current Time: ${time || "Unknown"}.\n`;
    
    if (schedule && schedule.length > 0) {
        systemContext += `Signal 2 [Schedule]: ${schedule}\n`;
    }
    
    if (habits && habits.length > 0) {
        systemContext += `Signal 4 [Frequency/Habits]: ${habits.join(', ')}\n`;
    }

    if (userProfile) {
        if (userProfile.name) systemContext += `User Name: ${userProfile.name}\n`;
        if (userProfile.facts && userProfile.facts.length > 0) {
            systemContext += `Key User Facts: ${userProfile.facts.join(', ')}\n`;
        }
    }

    const prompt = `
      # Role: ThoughtFlow Predictive Component (Context-Aware AAC)
      You are an advanced predictive engine for users with speech impairments. Your job is to predict the user's *intended next word* by fusing 5 real-time context signals.
      
      # The 5 Signals (Hierarchy of Importance):
      1. **Signal 6 [The Filter]**: HARD CONSTRAINT. Predictions MUST start with the user's current input: "${text}". 
         - **EXCEPTION**: If input is EMPTY, predict 4 distinct conversation starters based on Schedule/History/Time.
      2. **Signal 4 [The Habits]**: High Priority. Users repeat themselves. If a frequent habit matches the input/context, it wins.
      3. **Signal 2 [The Scheduler]**: Context Booster. If the schedule says "Art Class", boost words like "paint", "color", "canvas".
      4. **Signal 1 [The Listener]**: Conversation Continuity. If the last message was a question, suggest an answer.
      5. **Signal 5 [The Grammar]**: Syntactic Validity. Ensure the sentence makes grammatical sense.

      # Current State Signals
      ${systemContext}
      [Signal 1 - Recent History]:
      ${history || "None"}
      
      [Signal 4 - Habit Bank]:
      ${habits && habits.length > 0 ? habits.slice(0, 50).join(', ') : "None provided"}

      [Signal 6 - Current Input Buffer]:
      "${text}"

      # Prediction Algorithm (Execute Step-by-Step):
      1. **Analyze Schedule**: Extract 3-5 keywords related to the current "${schedule}" context. (Mental Scratchpad).
      2. **Filter Habits**: Check if any provided habits match the current input "${text}". (Or if empty input, suggest top habits).
      3. **Check History**: Does the last message require a specific response type (Yes/No, Location, Time)?
      4. **Synthesize**: Generate 4 predictions that satisfy the Filter Constraint ("${text}...") and maximize Context Relevance.
         - *Conflict Rule*: If a word fits the Schedule Context (e.g., input "b" -> "brush" in Art Class), it beats a generic word (e.g., "but"), unless "but" is syntactically required.
      
      # Output Format
      Return a SINGLE JSON object. No markdown.
      {
        "thought_process": "1-sentence explanation of how you used Schedule/History to choose these specific words.",
        "predictions": [
          { "word": "Label1", "sentence": "Complete, conversational sentence." },
          { "word": "Label2", "sentence": "Complete, conversational sentence." },
          // ...
          { "word": "Label4", "sentence": "Complete, conversational sentence." }
        ]
      }

      # Guidelines for 'word' field:
      - This appears in a small bubble. Keep it SHORT (1-2 words max).
      - Do NOT use slashes or prefixes like "Icon/". Just the word itself.

      # Guidelines for 'sentence' field:
      - **Conversational**: Must be a natural thing to say.

      - **Expansion**: If 'word' is "Water", 'sentence' must be "I need some water please" or "Can I get a drink?". NEVER just "Water".
      - **Grammar**: Fix articles and pronouns. (e.g., "to face" -> "to my face").
      - **Variety**: If reasonable, offer slightly different intents for the same word, or varied phrasing.
      - **Completeness**: Even if the user only typed a few letters, the 'sentence' should be the FULL thought.


    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    console.log("Gemini Raw:", rawText);

    // Clean up markdown if Gemini adds it despite instructions
    const jsonStr = rawText.replace(/```json|```/g, '').trim();
    
    let predictions: { word: string, sentence: string }[] = [];
    let reasoning = "Neural processing...";

    try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.predictions && Array.isArray(parsed.predictions)) {
            predictions = parsed.predictions;
            reasoning = parsed.thought_process || "Context analyzed.";
        } else if (Array.isArray(parsed)) {
            // Fallback for array-only response (legacy/hallucination handling)
            // If it's strings, map to objects
            if (typeof parsed[0] === 'string') {
                 predictions = parsed.map((s: string) => ({ word: s, sentence: s }));
            } else {
                 predictions = parsed;
            }
        }
    } catch (e) {
      console.error("Failed to parse Gemini response:", rawText);
      predictions = [
        { word: "Yes", sentence: "Yes" }, 
        { word: "No", sentence: "No" }, 
        { word: "Help", sentence: "I need help" }, 
        { word: "More", sentence: "I want more" }
      ];
    }

    // Map to SuggestionResponse
    const suggestions: SuggestionResponse[] = predictions.map((pred, idx) => ({
      id: `gemini-${Date.now()}-${idx}`,
      label: pred.word, 
      text: pred.sentence, // Store the full sentence here
      type: 'prediction',
      confidence: 0.9 - (idx * 0.1)
    }));


    return NextResponse.json({ suggestions, reasoning });

  } catch (error) {
    console.error('Error in /api/predict:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
