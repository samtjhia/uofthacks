import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { word, categories } = await req.json();

    if (!word || !categories) {
      return NextResponse.json({ error: 'Word and categories are required' }, { status: 400 });
    }

    const prompt = `
      You are an expert AI for an AAC (Augmentative and Alternative Communication) device. 
      Your task is to categorize the user's new word into one of the existing categories.
      
      Word: "${word}"
      Existing Categories: ${categories.join(', ')}
      
      Return ONLY the exact name of the category that best fits the word. If none fit perfectly, choose the closest logical match. Do not explain.
    `;

    // Call Gemini API (using the same key/structure as other routes might if they exist, or standard fetch)
    // Assuming process.env.GEMINI_API_KEY is likely used elsewhere or we use OpenAI as fallback if Gemini isn't set up in my context yet
    // The user mentioned "Gemini API" in the prompt.
    
    // NOTE: This implementation assumes a generic LLM call structure. 
    // Adapting to standard Gemini 1.5 Flash fetch if available, otherwise using OpenAI as placeholder or generic struct.
    // I will use a standard fetch to Gemini endpoint.

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
         // Fallback logic or error if key missing. For now, we mock or error.
         return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error('Gemini API Error:', data);
        return NextResponse.json({ error: 'Failed to categorize' }, { status: 500 });
    }

    let category = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    // Basic cleanup
    if (category) {
        // Ensure it matches one of the inputs strictly if possible, or trust the LLM
        // We'll trust the LLM mostly but cleanup quotes
        category = category.replace(/['"]/g, '');
    }

    return NextResponse.json({ category });

  } catch (error) {
    console.error('Categorize Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
