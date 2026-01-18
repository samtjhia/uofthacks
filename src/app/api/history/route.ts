import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Message } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();
    // Load last 50 messages
    const history = await Message.find({}).sort({ timestamp: 1 }); // Oldest first for chat timeline
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { role, content } = await req.json();
    await connectToDatabase();

    const msg = await Message.create({
      role, 
      content,
      timestamp: new Date()
    });

    return NextResponse.json(msg);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectToDatabase();
    await Message.deleteMany({}); // Wipes everything
    return NextResponse.json({ message: 'History cleared' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
