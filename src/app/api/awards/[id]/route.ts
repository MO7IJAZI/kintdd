import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, title_ar, description, description_ar, imageUrl, isActive, order } = body;

    const award = await prisma.award.update({
      where: { id },
      data: {
        title,
        title_ar,
        description,
        description_ar,
        imageUrl,
        isActive,
        order,
      },
    });

    return NextResponse.json(award);
  } catch (error) {
    console.error('Error updating award:', error);
    return NextResponse.json(
      { error: 'Failed to update award' },
      { status: 500 }
    );
  }
}
