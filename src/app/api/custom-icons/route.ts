import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CustomIcon from '@/models/CustomIcon';

export async function GET() {
  try {
    await dbConnect();
    const icons = await CustomIcon.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ icons });
  } catch (error) {
    console.error('Failed to fetch custom icons:', error);
    return NextResponse.json({ error: 'Failed to fetch icons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { label, category, imageUrl } = body;

    if (!label || !category || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newIcon = await CustomIcon.create({
      label,
      category,
      imageUrl,
    });

    return NextResponse.json({ icon: newIcon }, { status: 201 });
  } catch (error) {
    console.error('Failed to save custom icon:', error);
    return NextResponse.json({ error: 'Failed to save icon' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await CustomIcon.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete custom icon:', error);
    return NextResponse.json({ error: 'Failed to delete icon' }, { status: 500 });
  }
}
