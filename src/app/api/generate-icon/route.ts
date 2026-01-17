import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { word } = await req.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    // Call OpenAI DALL-E 3 API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `A simple, flat vector icon of ${word}, minimal design, solid color, black background, suitable for an AAC communication board.`,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
       console.error('OpenAI API Error:', data);
       return NextResponse.json({ error: data.error?.message || 'Failed to generate image' }, { status: response.status });
    }

    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
        return NextResponse.json({ error: 'No image URL returned' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Generate Icon Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
