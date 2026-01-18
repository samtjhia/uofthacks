import { NextResponse } from 'next/server';
import { DEFAULT_VOICE_ID, DEFAULT_ELEVENLABS_MODEL } from '@/lib/voice';
import connectToDatabase from '@/lib/db';
import { Transition } from '@/lib/models';

export async function POST(req: Request) {
  const { text, voiceId, model } = await req.json();

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = voiceId || DEFAULT_VOICE_ID;
  const MODEL_ID = model || DEFAULT_ELEVENLABS_MODEL;

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'Missing ELEVENLABS_API_KEY on server' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY as string,
        },
        body: JSON.stringify({
          text: text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('ElevenLabs API error:', response.status, text);
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        parsed = { message: text };
      }
      return NextResponse.json({ error: parsed }, { status: response.status });
    }

    // --- LEARNING PHASE (Path Learning) ---
    // User successfully spoke. Let's memorize the paths.
    // Logic: "I want food" -> Learn: "I"->"want", "I want"->"food"
    const words = text.trim().split(/\s+/);
    if (words.length > 1) {
       // Fire and forget learning (don't block audio)
       (async () => {
         try {
           await connectToDatabase();
           for (let i = 0; i < words.length - 1; i++) {
             // Context is everything from start up to current word
             const contextPhrase = words.slice(0, i + 1).join(' ').toLowerCase(); 
             const nextWord = words[i+1]; 
             
             await Transition.findOneAndUpdate(
                { context: contextPhrase, next: nextWord },
                { 
                  $inc: { count: 1 },
                  $set: { lastUsed: new Date() }
                },
                { upsert: true }
             );
           }
         } catch (e) {
           console.error("Path learning failed", e);
         }
       })();
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('speak route error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}