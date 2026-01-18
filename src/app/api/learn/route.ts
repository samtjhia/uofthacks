import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Transition } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const { context, next } = await req.json();
    
    // Normalize inputs
    if (!context || !next) return NextResponse.json({ error: 'Missing context or next word' }, { status: 400 });

    const cleanContext = context.trim().toLowerCase();
    const cleanNext = next.trim(); // Keep original casing for display if needed, but comparison is what matters. 
    // Actually, grids usually have fixed casing. Let's start with lowercased context.

    await connectToDatabase();

    // Upsert the transition
    const transition = await Transition.findOneAndUpdate(
      { context: cleanContext, next: cleanNext },
      { 
        $inc: { count: 1 },
        $set: { lastUsed: new Date() }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, count: transition.count });
  } catch (error) {
    console.error('Learning error:', error);
    return NextResponse.json({ error: 'Failed to save transition' }, { status: 500 });
  }
}
