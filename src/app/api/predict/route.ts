import { NextRequest, NextResponse } from 'next/server';
import { SuggestionResponse } from '@/types';
import connectToDatabase from '@/lib/db';
import { Transition } from '@/lib/models';
import { generateCompletion } from '@/lib/ai';
import { searchMemory } from '@/lib/memory';

export async function POST(req: NextRequest) {
  try {
    const { text, history, time, schedule, userProfile, habits, mode, lastPartnerMessage } = await req.json();

    // 1. MEMORY ENGINE (Signal 3)
    // If the partner just spoke, search memory for context about what they said.
    let memoryContext = "";
    if (lastPartnerMessage) {
        console.log(`🔍 [Signal 3] Searching Memory for: "${lastPartnerMessage}"`);
        // Search for key terms in the partner's message
        // Optimization: We could use an LLM to extract keywords first, but raw search works for hackathons
        const memories = await searchMemory(lastPartnerMessage);
        if (memories.length > 0) {
            // Join with specific separators to prevent hallucinated merging
            memoryContext = memories.map((m, i) => `Fact ${i+1}: "${m.text}"`).join('\n');
            console.log("🧠 Memory Hit:", memoryContext);
        } else {
            console.log("🤷‍♂️ Memory Miss: No relevant memories found.");
        }
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
    
    // Config based on mode
    const isSpark = mode === 'spark';
    const outputCount = isSpark ? 12 : 4;
    
    // Spark mode relaxes the "Starts with..." constraint to allow for diverse ideas if text is empty/irrelevant
    const filterDirective = isSpark 
        ? `1. **Signal 6 [The Filter]**: Soft Constraint. If input "${text}" exists, prefer words starting with it. If empty, generate ${outputCount} distinct conversation starters.`
        : `1. **Signal 6 [The Filter]**: HARD CONSTRAINT. Predictions MUST start with the user's current input: "${text}". \n         - **EXCEPTION**: If input is EMPTY, predict ${outputCount} distinct conversation starters based on Schedule/History/Time.`;

    prompt = `
      # Role: ThoughtFlow Predictive Component (Context-Aware AAC)
      You are an advanced predictive engine for users with speech impairments. Your job is to predict the user's *intended next word* by fusing 5 real-time context signals.
      
      # The 5 Signals (Hierarchy of Importance):
      ${filterDirective}
      2. **Signal 1 [The Listener]**: **CRITICAL - MAXIMUM PRIORITY**. If the last history message is from 'partner' or is a QUESTION, your main job is to answer it. Ignoring a direct question is a failure.
      3. **Signal 3 [The Memory]**: Long-Term Info. Use this to answer specific factual questions (e.g., "When is the wedding?"). 
         - **WARNING**: Treat each retrieved Fact as ATOMIC. Do NOT merge unrelated facts (e.g. do not combine "I work at X" with "My favorite color is Y" unless the user asks for both).
      4. **Signal 4 [The Habits]**: High Priority. Users repeat themselves. If a frequent habit matches the input/context, it wins.
      5. **Signal 2 [The Scheduler]**: Context Booster. If the schedule says "Art Class", boost words like "paint", "color", "canvas".
      6. **Signal 5 [The Grammar]**: Syntactic Validity. Ensure the sentence makes grammatical sense.

      # Current State Signals
      ${systemContext}
      [Signal 1 - Recent History (MOST IMPORTANT FOR CONTEXT)]:
      ${history || "None"}

      [Signal 3 - Retrieved Memories (Long-Term Facts)]:
      ${memoryContext || "No relevant memories found."}
      
      [Signal 1.5 - LATEST PARTNER MESSAGE (The Trigger)]:
      "${lastPartnerMessage || "None"}"

      [Signal 4 - Habit Bank]:
      ${habits && habits.length > 0 ? habits.slice(0, 50).join(', ') : "None provided"}

      [Signal 6 - Current Input Buffer]:
      "${text}"

      # Prediction Algorithm (Execute Step-by-Step):
      1. **Status Check**: Is the input "${text}" empty?
      2. **IF INPUT IS EMPTY**: 
         - **FOCUS ON [Signal 1.5 - LATEST PARTNER MESSAGE]**: This is the message you are responding to. Ignore older history if this is present.
         - **CASE A: Partner Message is a QUESTION**: Your ${outputCount} predictions MUST be direct answers to it.
            - **CRITICAL**: Check [Signal 3 - Retrieved Memories]. If a memory provides the answer (e.g. Question: "What is my fav color?", Memory: "Sam's fav color is green"), you MUST provide that answer as the Top Prediction.
         - **CASE B: Partner Message is a STATEMENT/GREETING** (e.g. "Hello there"): Your predictions MUST be relevant follow-ups/replies.
         - **CASE C: No Partner Message**: Suggest conversational starters based on Schedule/Location.
      3. **IF INPUT IS NOT EMPTY**:
         - Filter suggested habits/words to strictly start with "${text}".
         - Prioritize words that *complete the answer* to the previous question if applicable.
      
      # Output Format
      Return a SINGLE JSON object. No markdown.
      {
        "thought_process": "Explain why you chose these words. If History was used, explicitly mention 'Answering Question: [Question]'.",
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

    let rawText = "";
    let usedModel = "";

    try {
        const result = await generateCompletion(
            "You are a predictive text engine. Output JSON only.",
            prompt,
            true
        );
        rawText = result.text;
        usedModel = result.model;
        console.log(`🧠 AI Response [${usedModel}]:`, rawText.substring(0, 100) + "...");
    } catch (e) {
        console.error("AI Generation Failed:", e);
        throw e;
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
      console.error("Failed to parse Gemini/OpenAI response:", rawText);
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
            id: `pred-${Date.now()}-${idx}`,
            label: niceLabel, 
            text: pred.sentence, // Store the full sentence here
            type: 'prediction',
            confidence: 0.9 - (idx * 0.1)
        };
    });
    
    return NextResponse.json({ suggestions, reasoning, model: usedModel });

  } catch (error) {
    console.error('Error in /api/predict:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
