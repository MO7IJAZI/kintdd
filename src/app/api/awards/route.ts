import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all active awards
    const awards = await prisma.award.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(awards);
  } catch (error) {
    console.error('Error fetching awards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch awards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, title_ar, description, description_ar, imageUrl, isActive, order } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and Image URL are required' },
        { status: 400 }
      );
    }

    const award = await prisma.award.create({
      data: {
        title,
        title_ar,
        description,
        description_ar,
        imageUrl,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });

    return NextResponse.json(award);
  } catch (error) {
    console.error('Error creating award:', error);
    return NextResponse.json(
      { error: 'Failed to create award' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.award.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting award:', error);
    return NextResponse.json(
      { error: 'Failed to delete award' },
      { status: 500 }
    );
  }
}
