import { NextResponse } from 'next/server';
import { getAllMemories, deleteAllMemories } from '@/lib/memory';

export async function GET() {
  try {
    const memories = await getAllMemories();
    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await deleteAllMemories();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete memories' }, { status: 500 });
  }
}
