import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// --- CONFIGURATION ---
// Toggle this to switch the ENTIRE APP between Gemini and OpenAI
// Options: 'gemini' | 'openai'
export const ACTIVE_PROVIDER: 'gemini' | 'openai' = 'openai';

// -- MODELS --
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const OPENAI_MODEL = 'gpt-4o-mini';

// --- INITIALIZATION ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true // Only if needed client-side, but we usually run this server-side
});

interface CompletionResult {
    text: string;
    model: string;
}

/**
 * Unified completion function that switches between OpenAI and Gemini
 */
export async function generateCompletion(
    systemPrompt: string, 
    userPrompt: string,
    jsonMode: boolean = false,
    providerOverride?: 'gemini' | 'openai'
): Promise<CompletionResult> {
    
    const provider = providerOverride || ACTIVE_PROVIDER;
    console.log(`🧠 AI Request [${provider.toUpperCase()}]`);

    try {
        if (provider === 'openai') {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: OPENAI_MODEL,
                response_format: jsonMode ? { type: "json_object" } : { type: "text" },
                temperature: 0.7,
            });
            
            return {
                text: completion.choices[0].message.content || "",
                model: OPENAI_MODEL
            };
        } 
        else {
            // Gemini Implementation
            const model = genAI.getGenerativeModel({ 
                model: GEMINI_MODEL,
                generationConfig: {
                    responseMimeType: jsonMode ? "application/json" : "text/plain"
                }
            });

            // Gemini doesn't have strict "system" roles in the same way, 
            // but we can prepend it or use the systemInstruction property in newer SDKs.
            // For safety/compatibility, we'll prepend.
            const fullPrompt = `${systemPrompt}\n\nUser Input:\n${userPrompt}`;
            
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            
            return {
                text: response.text(),
                model: GEMINI_MODEL
            };
        }
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
}

/**
 * Unified embedding function (for Vector Search)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (ACTIVE_PROVIDER === 'openai') {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });
        return response.data[0].embedding;
    } else {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    }
}
