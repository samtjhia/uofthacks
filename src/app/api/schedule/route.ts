import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ScheduleItem } from '@/lib/models';

export async function GET() {
  await dbConnect();

  try {
    const items = await ScheduleItem.find({});
    // We can sort them on the client or here.
    // Client-side mapping to "Morning", "Afternoon" arrays is easier if we just send the flat list.
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { label, timeBlock } = body;

    if (!label || !timeBlock) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Simple order logic: put at end
    const count = await ScheduleItem.countDocuments({ timeBlock });
    
    const newItem = await ScheduleItem.create({
      label,
      timeBlock,
      order: count,
    });

    return NextResponse.json({ item: newItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  try {
    await ScheduleItem.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
