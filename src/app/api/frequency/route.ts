import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Habit } from '@/lib/models';

// GET: Fetch top suggestions based on frequency (Signal 4)
export async function GET() {
  try {
    await connectToDatabase();
    
    // Logic: Get top 20 most used phrases, sorted by count (desc) then recency
    const topHabits = await Habit.find({})
      .sort({ usageCount: -1, lastUsed: -1 })
      .limit(20);
      
    return NextResponse.json(topHabits);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch usage frequency' }, { status: 500 });
  }
}

// POST: "Reinforce" a habit (Increment usage count)
export async function POST(req: NextRequest) {
  try {
    const { text, category } = await req.json();
    await connectToDatabase();

    // Upsert: Find phrase. If exists, increment count. If not, create it.
    const habit = await Habit.findOneAndUpdate(
      { text: text },
      { 
        $inc: { usageCount: 1 }, 
        $set: { lastUsed: new Date(), category: category || 'general' } 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update habit frequency' }, { status: 500 });
  }
}
