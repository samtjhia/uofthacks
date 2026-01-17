import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 1. Check file size (filter out very short/silent audio files)
    // 5KB is a rough heuristic for < 0.5s of audio or silence
    if (file.size < 5000) {
      return NextResponse.json({ text: '[No speech detected]' });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      prompt: 'listening to a conversation. only transcribe speech.',
      response_format: 'verbose_json',
    }) as any;

    const text = transcription.text.trim();

    // Check segments for confidence (Hallucination on silence usually has high no_speech_prob)
    if (transcription.segments) {
      const segments = transcription.segments;
      // Check if any segment is "good enough" or if generally it's bad
      if (segments.length > 0) {
        const avgNoSpeech = segments.reduce((sum: number, seg: any) => sum + seg.no_speech_prob, 0) / segments.length;
        const avgLogProb = segments.reduce((sum: number, seg: any) => sum + seg.avg_logprob, 0) / segments.length;

        // Rule: If no_speech_prob > 0.4 (40% probability of silence), return empty string
        if (avgNoSpeech > 0.4) return NextResponse.json({ text: '[No speech detected]' });
        
        // Rule: If avg_logprob < -1.0 (Low confidence), return empty string
        if (avgLogProb < -1.0) return NextResponse.json({ text: '[No speech detected]' });
      }
    }

    // 2. Hallucination Filter
    const HALLUCINATIONS = [
      'Thank you.',
      'You.',
      'You',
      'MBC News',
      'Copyright',
      'Bye.',
      '.',
      'Subtitle by...',
      'Computers enhancing communication with teammates',
    ];

    // If text matches typical Whisper hallucinations or is extremely short, ignore it
    const normalizedText = text.toLowerCase().trim();
    const isHallucination = HALLUCINATIONS.some(
      h => normalizedText === h.toLowerCase().trim()
    );

    if (isHallucination || text.length < 2) {
      return NextResponse.json({ text: '[No speech detected]' });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing audio' },
      { status: 500 }
    );
  }
}
