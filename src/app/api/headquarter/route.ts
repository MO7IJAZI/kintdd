import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const headquarter = await prisma.headquarter.findFirst();
    return NextResponse.json(headquarter || {});
  } catch (error) {
    console.error('Error fetching headquarter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch headquarter' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, title_ar, content, content_ar, address, address_ar, latitude, longitude } = body;

    const existing = await prisma.headquarter.findFirst();

    const latitudeValue = latitude === '' || latitude === null || latitude === undefined ? null : Number(latitude);
    const longitudeValue = longitude === '' || longitude === null || longitude === undefined ? null : Number(longitude);

    const data = {
      title: title || 'Company Headquarter',
      title_ar,
      content,
      content_ar,
      address,
      address_ar,
      latitude: Number.isFinite(latitudeValue) ? latitudeValue : null,
      longitude: Number.isFinite(longitudeValue) ? longitudeValue : null,
    };

    if (existing) {
      const updated = await prisma.headquarter.update({
        where: { id: existing.id },
        data,
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.headquarter.create({
        data,
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Error saving headquarter:', error);
    return NextResponse.json(
      { error: 'Failed to save headquarter' },
      { status: 500 }
    );
  }
}
