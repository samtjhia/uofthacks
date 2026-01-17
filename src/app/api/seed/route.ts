import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Habit } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();

    const initialHabits = [
      { text: "I would like a slice of pizza", category: "food" },
      { text: "I need to use the restroom", category: "needs" },
      { text: "Can you help me?", category: "help" },
      { text: "Good morning", category: "greeting" },
      { text: "Thank you", category: "politeness" },
      { text: "Yes", category: "confirmation" },
      { text: "No", category: "negation" },
    ];

    const operations = initialHabits.map((habit) => ({
      updateOne: {
        filter: { text: habit.text },
        update: { 
          $set: { 
            text: habit.text, 
            category: habit.category 
          },
          $setOnInsert: {
            usageCount: 1, // Start with 1 usage so it shows up? Or 0? Schema default is 1.
            lastUsed: new Date()
          }
        },
        upsert: true,
      },
    }));

    await Habit.bulkWrite(operations);

    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      seededCount: initialHabits.length,
      habits: initialHabits.map(h => h.text)
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' }, 
      { status: 500 }
    );
  }
}
