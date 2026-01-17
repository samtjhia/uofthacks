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

// Helper
const calculateEndTime = (start?: string, duration?: number): string | undefined => {
  if (!start) return undefined;
  const mins = duration || 30;
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + mins;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { label, timeBlock, startTime, durationMinutes } = body;

    if (!label || !timeBlock) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Simple order logic: put at end
    const count = await ScheduleItem.countDocuments({ timeBlock });

    const endTime = calculateEndTime(startTime, durationMinutes);
    
    const newItem = await ScheduleItem.create({
      label,
      timeBlock,
      startTime, 
      durationMinutes,
      endTime,
      order: count,
    });

    return NextResponse.json({ item: newItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { id, label, startTime, durationMinutes, timeBlock } = body;

    if (!id) {
       return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // In a real app we might need to fetch the existing item to calc endTime if only one field changes
    // But for now, we assume frontend sends both start and duration if calculating time.
    let endTimeUpdates = {};
    if (startTime !== undefined || durationMinutes !== undefined) {
         // This is tricky if we don't know the other value.
         // Let's fetch the item first to be safe and accurate.
         const existing = await ScheduleItem.findById(id);
         if (existing) {
             const newStart = startTime !== undefined ? startTime : existing.startTime;
             const newDuration = durationMinutes !== undefined ? durationMinutes : existing.durationMinutes;
             const newEnd = calculateEndTime(newStart, newDuration);
             endTimeUpdates = { endTime: newEnd };
         }
    }

    const updated = await ScheduleItem.findByIdAndUpdate(id, {
        ...(label && { label }),
        ...(startTime !== undefined && { startTime }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(timeBlock && { timeBlock }),
        ...endTimeUpdates
    }, { new: true });

    return NextResponse.json({ item: updated });
  } catch (error) {
     return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
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
