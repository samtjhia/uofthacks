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
      response_format: 'verbose_json',
      temperature: 0.0,
      language: 'en',
    }) as any;

    const text = transcription.text.trim();

    // Check segments for confidence (Hallucination on silence usually has high no_speech_prob)
    if (transcription.segments) {
      const segments = transcription.segments;
      // Check if any segment is "good enough" or if generally it's bad
      if (segments.length > 0) {
        const avgNoSpeech = segments.reduce((sum: number, seg: any) => sum + seg.no_speech_prob, 0) / segments.length;
        const avgLogProb = segments.reduce((sum: number, seg: any) => sum + seg.avg_logprob, 0) / segments.length;

        // Rule: If no_speech_prob > 0.5 (Increased tolerance slightly), return empty
        if (avgNoSpeech > 0.5) return NextResponse.json({ text: '[No speech detected]' });
      }
    }

    // 2. Hallucination Filter (Known bad phrases from YouTube subtitles training data)
    const HALLUCINATION_PHRASES = [
      'Thank you for watching',
      'Thanks for watching',
      'Please subscribe',
      'comments section',
      'Any questions or comments',
      'MBC News',
      'Copyright',
      'Subtitle by',
      'translated by',
      'Amara.org',
      'Computers enhancing communication'
    ];
    
    // Strict Short-Phrase Filter
    const EXACT_HALLUCINATIONS = [
       'You.', 'Bye.', 'Thank you.', '.'
    ];

    const normalizedText = text.toLowerCase().trim();
    
    // Check for partial matches of long known hallucinations
    const containsHallucination = HALLUCINATION_PHRASES.some(h => normalizedText.includes(h.toLowerCase()));
    
    // Check for exact matches of short glitches
    const isExactHallucination = EXACT_HALLUCINATIONS.some(h => normalizedText === h.toLowerCase());

    if (containsHallucination || isExactHallucination || text.length < 2) {
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
