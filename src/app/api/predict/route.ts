import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { SuggestionResponse } from '@/types';
import connectToDatabase from '@/lib/db';
import { Transition } from '@/lib/models';

// --- CONFIGURATION ---
// Change this to 'gemini' or 'openai' to switch providers
const ACTIVE_PROVIDER: 'gemini' | 'openai' = (process.env.AI_PROVIDER as 'gemini' | 'openai') || 'openai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { text, history, time, schedule, userProfile, habits, mode } = await req.json();

    // Check Keys based on provider
    if (ACTIVE_PROVIDER === 'gemini' && !process.env.GEMINI_API_KEY) {
       return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }
    if (ACTIVE_PROVIDER === 'openai' && !process.env.OPENAI_API_KEY) {
       return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    // --- SIGNAL 5: LEARNED TRANSITIONS (DB CHECK) ---
    // Optimization: If we have strong user habits, use DB results (50ms) instead of LLM (1.5s).
    await connectToDatabase();
    let learnedContext = "";
    
    // Only attempt Reflex if we have input text to pivot from
    if (text && text.trim().length > 0) {
        // --- PATH-BASED LEARNING UPDATE ---
        // Instead of just the last word, we use the ENTIRE TYPED PATH as context.
        // If user typed "i want", we look for context="i want" -> next="to"
        const fullContextPath = text.trim().toLowerCase();
        
        try {
            // Find transitions where 'context' matches our full path
            const transitions = await Transition.find({ context: fullContextPath })
                                            .sort({ count: -1, lastUsed: -1 })
                                            .limit(12); // Get top choices
            
            // REFLEX CIRCUIT: If we have ANY learned data, return it immediately.
            if (transitions.length > 0) {
                 const reflexSuggestions = transitions.map(t => ({
                    id: t._id.toString(),
                    label: t.next, 
                    text: t.next, 
                    type: 'reflex' // Special type indicating DB source
                 }));

                 return NextResponse.json({
                    thought_process: `⚡ REFLEX ACTIVATED: Exact path match found for "${fullContextPath}".`,
                    suggestions: reflexSuggestions,
                    model: 'Reflex (DB)'
                 });
            }
        } catch (dbErr) {
            console.warn("Reflex DB Lookup failed:", dbErr);
            // Continue to LLM as fallback
        }
    }


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

    let prompt = "";

    if (mode === 'spark') {
        prompt = `
          # Role: ThoughtFlow Spark Engine (Conversation Starters)
          Your goal is to generate 12 engaging "Conversation Starters" based purely on the user's current context (Time, Schedule, Mood/Profile).
          
          # Context Signals:
          ${systemContext}

          # Instructions:
          - IGNORE previous chat history. We are starting a NEW topic.
          - IGNORE any typed text. The user is asking for fresh ideas.
          - Focus heavily on the **Schedule** and **Time**.
          - If the schedule says "Lunch", suggest food-related openers.
          - If the time is morning, suggest greetings.
          - If no specific schedule, use general social openers suitable for the user's profile.

          # Output Format (JSON Only):
          {
            "thought_process": "Why you chose these starters based on schedule/time.",
            "predictions": [
              { "word": "Topic With Spaces", "sentence": "Full conversational starter sentence." },
              { "word": "Another Topic", "sentence": "Full conversational starter sentence." },
              // ... generate 12 total
            ]
          }

          # Guidelines for 'word':
          - **Use Title Case and SPACES**. (e.g., "Dining Experience", NOT "DININGEXPERIENCE").
          - Keep it short (2-3 words max).
        `;
    } else {
        prompt = `
          # Role: ThoughtFlow Predictive Component (Context-Aware AAC)
          Your job is to predict the user's *intended next word* by fusing 5 real-time context signals.
          
          # The 5 Signals (Hierarchy of Importance):
          1. **Signal 6 [The Filter]**: HARD CONSTRAINT. Predictions MUST start with the user's current input: "${text}". 
             - **EXCEPTION**: If input is EMPTY, predict 4 distinct conversation starters based on Schedule/History/Time.
          2. **Signal 1 [The Listener]**: CRITICAL PRIORITY. Conversation Continuity. If the last message was a question, suggesting a direct answer is the top priority.
          3. **Signal 4 [The Habits]**: High Priority. Users repeat themselves. If a frequent habit matches the input/context, it wins.
          4. **Signal 2 [The Scheduler]**: Context Booster. If the schedule says "Art Class", boost words like "paint", "color", "canvas".
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
          1. **Check History (Signal 1)**: IMMEDIATELY analyze the last incoming message. Does it demand a response (Who/What/Where/When)? If yes, prioritize answers in the predictions.
          2. **Analyze Schedule**: Extract keywords related to the current "${schedule}" context.
          3. **Filter Habits**: Check if any provided habits match the current input "${text}".
          4. **Synthesize**: Generate 4 predictions that satisfy the Filter Constraint ("${text}...") and maximize Context Relevance.
             - *Conflict Rule*: If History demands an answer (e.g., "Do you want water?"), predict "Yes"/"No" or relevant answers BEFORE schedule/habit suggestions.
          
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
    }

    let rawText = "";

    console.log(`🧠 Predicting with Provider: ${ACTIVE_PROVIDER.toUpperCase()}`);

    if (ACTIVE_PROVIDER === 'openai') {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a predictive text engine. Output JSON only." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o-mini", // Recommended for speed/cost (comparable to Flash)
            response_format: { type: "json_object" },
            temperature: 0.7,
        });
        rawText = completion.choices[0].message.content || "{}";
        console.log("OpenAI Raw:", rawText);
    } 
    else {
        // Use Gemini 2.0 Flash Experimental
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawText = response.text();
        console.log("Gemini Raw:", rawText);
    }

    // Clean up markdown if AI adds it (Gemini often does, OpenAI in JSON mode usually doesn't but safe to keep)
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
    const suggestions: SuggestionResponse[] = predictions.map((pred, idx) => {
        // Fallback: Fix CamelCase if the AI failed to add spaces (e.g. "DiningExperience" -> "Dining Experience")
        let niceLabel = pred.word;
        if (!niceLabel.includes(' ') && niceLabel.length > 8) {
             niceLabel = niceLabel.replace(/([a-z])([A-Z])/g, '$1 $2');
        }

        return {
            id: `${ACTIVE_PROVIDER}-${Date.now()}-${idx}`,
            label: niceLabel, 
            text: pred.sentence, // Store the full sentence here
            type: 'prediction',
            confidence: 0.9 - (idx * 0.1)
        };
    });
    
    // MODEL METADATA
    const usedModel = ACTIVE_PROVIDER === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash-exp';

    return NextResponse.json({ suggestions, reasoning, model: usedModel });

  } catch (error) {
    console.error('Error in /api/predict:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
