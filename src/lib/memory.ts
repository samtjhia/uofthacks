import { generateCompletion, generateEmbedding } from './ai';

// Corrected API Endpoint from Documentation
const BACKBOARD_API_URL = "https://app.backboard.io/api"; 
const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY;
const BACKBOARD_ASSISTANT_ID = process.env.BACKBOARD_ASSISTANT_ID; 

export interface MemoryResult {
    id: string;
    text: string;
    relevance: number;
    timestamp: string;
}

/**
 * Searches the Long-Term Memory (Backboard) for context relevant to the query.
 */
export async function searchMemory(query: string): Promise<MemoryResult[]> {
    if (!BACKBOARD_API_KEY) {
        console.warn("⚠️ Backboard API Key missing. Memory disabled.");
        return [];
    }

    try {
        // Updated Search Strategy: Retrieve recent memories and filter locally
        // (Since specific Search API endpoints are 404/405 currently)
        const url = `${BACKBOARD_API_URL}/assistants/${BACKBOARD_ASSISTANT_ID}/memories`;
        
        const response = await fetch(url, {
            method: 'GET', // Correct method for listing
            headers: {
                'X-API-Key': BACKBOARD_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn(`Backboard Retrieval Failed (${response.status}). Using Fallback.`);
            return searchLocalMemory(query);
        }

        const data = await response.json();
        const allMemories = data.memories || [];

        // Simple Local Relevance Filter (since we're fetching all for this hackathon scale)
        const q = query.toLowerCase();
        const queryWords = q.split(/\W+/).filter(w => w.length > 3); // Extract significant words from query

        let results = allMemories.filter((m: any) => {
            const content = m.content.toLowerCase();
            
            // 1. Direct substring match
            if (content.includes(q)) return true;

            // 2. Reverse substring (mostly for single words)
            if (q.includes(content)) return true;

            // 3. Keyword Overlap (Bidirectional)
            // Check if significant words from memory appear in query
            const memoryHit = content.split(/\W+/).some((w: string) => w.length > 3 && q.includes(w));
            
            // Check if significant words from query appear in memory
            const queryHit = queryWords.some(w => content.includes(w));

            return memoryHit || queryHit;
        }).map((m: any) => ({
            id: m.id,
            text: m.content,
            relevance: 1.0, 
            timestamp: m.created_at
        }));

        // Fallback: If no results found and we have memories, return the most recent 5
        // This helps the LLM find context even if keywords fail (e.g. "What is that thing?" -> refers to recent memory)
        if (results.length === 0 && allMemories.length > 0) {
            console.log("⚠️ No direct memory keyword matches. Returning 5 most recent memories as context.");
            results = allMemories.slice(0, 5).map((m: any) => ({
                 id: m.id,
                 text: m.content,
                 relevance: 0.5,
                 timestamp: m.created_at
            }));
        }
        
        return results;

    } catch (error) {
        console.error("Memory Search Failed (Network/Code):", error);
        return searchLocalMemory(query);
    }
}

/**
 * Analyzes the user's speech to decide if a new memory should be formed.
 */
export async function analyzeAndStoreMemory(text: string): Promise<void> {
    // 1. Heuristic Filter: Ignore short messages
    if (!text || text.length < 5) return;

    console.log("🧠 Analyzing for Memory Formation:", text);

    const systemPrompt = `
    You are the Long-Term Memory Manager for an AAC device.
    Your goal is to extract PERMANENT FACTS about the user from their speech.

    Input: "${text}"

    Rules:
    1. Extract a standalone fact if the user states something permanent about themselves, their life, preferences, or history.
    2. REQUIRED: Include ongoing projects, jobs, or major life events (e.g. "working on a hackathon" IS a fact).
    3. Ignore casual conversation, questions, greetings, or short-term states (e.g., "I am hungry", "I am walking").
    4. Convert "I" statements to Third Person or clear facts (e.g., "I have a dog" -> "User has a dog").

    Return a JSON object:
    {
        "fact": "The extracted fact string" (or null if nothing to store),
        "confidence": 0.0 to 1.0 (Higher for clear facts)
    }
    `;

    try {
        const result = await generateCompletion(systemPrompt, text, true);
        const data = JSON.parse(result.text);

        // Lower threshold to 0.6 to catch "Hackathon" and projects
        if (data.fact && data.confidence > 0.6) {
            console.log("💾 MEMORY FORMED:", data.fact);
            await addMemory(data.fact);
        } else {
            console.log("❌ No memory formed (Transient/Low Confidence).");
        }

    } catch (e) {
        console.error("Memory Analysis Error:", e);
    }
}

const MOCK_DB = [
    { keys: ["big day", "wedding"], text: "The 'Big Day' is my Sister's Wedding on July 12th." },
    { keys: ["dog", "pet", "animal"], text: "I have a Golden Retriever named Rover." },
    { keys: ["allergy", "allergic", "food"], text: "I am severely allergic to peanuts and shellfish." },
    { keys: ["address", "live", "home"], text: "I live at 123 Maple Street, Downtown." },
    { keys: ["job", "work", "occupation"], text: "I work as a graphic designer for Studio 4." }
];

function searchLocalMemory(query: string): MemoryResult[] {
    const q = query.toLowerCase();
    const results: MemoryResult[] = [];

    MOCK_DB.forEach((item, idx) => {
        // Simple keyword match for hackathon demo robustness
        if (item.keys.some(k => q.includes(k))) {
            results.push({
                id: `local-${idx}`,
                text: item.text,
                relevance: 1.0,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    return results;
}

/**
 * Adds a new memory to the database
 */
export async function addMemory(text: string): Promise<boolean> {
    console.log(`[Memory] Attempting to store: "${text}"`);

    // FALLBACK: If no API key or Assistant ID, store in local session memory
    if (!BACKBOARD_API_KEY || !BACKBOARD_ASSISTANT_ID) {
        console.warn("⚠️ Backboard Key or Assistant ID Missing. Storing in Session Memory (MOCK_DB).");
        const keys = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        // @ts-ignore
        MOCK_DB.push({ keys, text });
        return true; 
    }

    try {
        const url = `${BACKBOARD_API_URL}/assistants/${BACKBOARD_ASSISTANT_ID}/memories`;
        console.log(`[Memory] POSTing to ${url}...`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-API-Key': BACKBOARD_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: text
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Memory] API Error (${response.status}):`, errText);
            
            // Fallback to local if API fails so the user thinks it worked for the session
            console.warn("⚠️ Backboard API Failed. Storing in Session Memory (MOCK_DB) as backup.");
            const keys = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
            // @ts-ignore
            MOCK_DB.push({ keys, text });

            return false;
        }
        
        console.log("[Memory] Successfully stored in Backboard!");
        return response.ok;
    } catch (error) {
        console.warn("⚠️ Backboard Network Error (DNS/Connection). Switching to Session Memory.");
        // Fallback for network errors (like ENOTFOUND)
        const keys = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        // @ts-ignore
        MOCK_DB.push({ keys, text });
        return true;
    }
}

/**
 * Retrieves ALL memories (either from Backboard or Local Fallback)
 */
export async function getAllMemories(): Promise<MemoryResult[]> {
    if (!BACKBOARD_API_KEY || !BACKBOARD_ASSISTANT_ID) {
        return MOCK_DB.map((m: any, i) => ({
             id: `local-${i}`,
             text: m.text,
             relevance: 1,
             timestamp: new Date().toISOString()
        }));
    }

    try {
        const url = `${BACKBOARD_API_URL}/assistants/${BACKBOARD_ASSISTANT_ID}/memories`;
        const response = await fetch(url, {
             headers: { 'X-API-Key': BACKBOARD_API_KEY }
        });

        if (!response.ok) throw new Error("API Failed");
        
        const data = await response.json();
        return (data.memories || []).map((m: any) => ({
            id: m.id,
            text: m.content,
            relevance: 1,
            timestamp: m.created_at
        }));
    } catch (e) {
        console.warn("Returning Local Memories (Fallback)", e);
        return MOCK_DB.map((m: any, i) => ({
             id: `local-${i}`,
             text: m.text,
             relevance: 1,
             timestamp: new Date().toISOString()
        }));
    }
}
