import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all certificates
export async function GET() {
    try {
        const certificates = await prisma.certificate.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        return NextResponse.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
    }
}

// POST create new certificate
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, title_ar, description, description_ar, imageUrl, order } = body;

        if (!title || !imageUrl) {
            return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 });
        }

        // Check count limit
        const count = await prisma.certificate.count({ where: { isActive: true } });
        if (count >= 5) {
            return NextResponse.json({ error: 'Maximum limit of 5 certificates reached' }, { status: 400 });
        }

        const certificate = await prisma.certificate.create({
            data: {
                title,
                title_ar,
                description,
                description_ar,
                imageUrl,
                order: order || 0,
            },
        });

        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Error creating certificate:', error);
        return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
    }
}

// PUT update certificate
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, title_ar, description, description_ar, imageUrl, order, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const certificate = await prisma.certificate.update({
            where: { id },
            data: {
                title,
                title_ar,
                description,
                description_ar,
                imageUrl,
                order,
                isActive,
            },
        });

        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Error updating certificate:', error);
        return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
    }
}

// DELETE certificate
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await prisma.certificate.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
    }
}
