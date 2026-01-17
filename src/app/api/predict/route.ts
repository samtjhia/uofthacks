import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SuggestionResponse } from '@/types';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { text, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Use Gemini 2.0 Flash Experimental for maximum speed
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
      You are an AAC (Augmentative and Alternative Communication) assistive predictive engine.
      Your goal is to predict the *next most likely word or short phrase* the user wants to say, based on their current input and context.
      
      Context (Recent History): ${history || "None"}
      Current Input: "${text}"

      Instructions:
      1. Analyze the Current Input. If it ends in a space, predict the next word. If it's midway through a word, predict the completion or the full word options.
      2. If the input is a complete thought, suggest follow-up phrases.
      3. Return EXACTLY 4 distinct predictions.
      4. Return ONLY a valid JSON array of strings. Do not include markdown formatting or correct grammar explanation.
      
      Example Output: ["want", "need", "am", "will"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Clean up markdown if Gemini adds it despite instructions
    const jsonStr = rawText.replace(/```json|```/g, '').trim();
    
    let predictions: string[] = [];
    try {
      // Find JSON array brackets
      const firstBracket = jsonStr.indexOf('[');
      const lastBracket = jsonStr.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        const cleanJson = jsonStr.substring(firstBracket, lastBracket + 1);
        predictions = JSON.parse(cleanJson);
      } else {
         predictions = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error("Failed to parse Gemini response:", rawText);
      predictions = ["Yes", "No", "Help", "More"];
    }

    // Map to SuggestionResponse
    const suggestions: SuggestionResponse[] = predictions.map((pred, idx) => ({
      id: `gemini-${Date.now()}-${idx}`,
      label: pred, 
      text: pred,
      type: 'prediction',
      confidence: 0.9 - (idx * 0.1)
    }));

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Error in /api/predict:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
