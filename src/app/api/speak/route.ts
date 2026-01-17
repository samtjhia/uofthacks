import { NextResponse } from 'next/server';
import { DEFAULT_VOICE_ID, DEFAULT_ELEVENLABS_MODEL } from '@/lib/voice';

export async function POST(req: Request) {
  const { text, voiceId, model, settings } = await req.json();

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = voiceId || DEFAULT_VOICE_ID;
  const MODEL_ID = model || DEFAULT_ELEVENLABS_MODEL;

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'Missing ELEVENLABS_API_KEY on server' }, { status: 500 });
  }
  
  // Default Settings
  const voiceSettings = settings || {
    stability: 0.5,
    similarity_boost: 0.5,
  };

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
          voice_settings: voiceSettings,
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