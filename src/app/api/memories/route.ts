import { NextResponse } from 'next/server';
import { getAllMemories } from '@/lib/memory';

export async function GET() {
  try {
    const memories = await getAllMemories();
    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}
