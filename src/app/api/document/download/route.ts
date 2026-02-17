import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type PrismaDocumentDelegate = {
    update: (args: unknown) => Promise<unknown>;
    findFirst: (args: unknown) => Promise<{ id: string; filePath: string } | null>;
};

const prismaDocument = (prisma as unknown as { document: PrismaDocumentDelegate }).document;

export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        const document = await prismaDocument.findFirst({
            where: { id, isActive: true },
            select: { id: true, filePath: true }
        });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const filePath = document.filePath;
        if (!filePath || typeof filePath !== 'string' || !filePath.startsWith('/') || filePath.includes('://')) {
            return NextResponse.json({ error: 'Invalid document file path' }, { status: 400 });
        }

        await prismaDocument.update({
            where: { id },
            data: { downloads: { increment: 1 } }
        });

        return NextResponse.redirect(new URL(filePath, request.nextUrl.origin));
    } catch (error) {
        console.error('Error processing document download:', error);
        return NextResponse.json({ error: 'Failed to process download' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        // Increment download count
        await prismaDocument.update({
            where: { id },
            data: { downloads: { increment: 1 } }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error incrementing download count:', error);
        return NextResponse.json(
            { error: 'Failed to increment download count' },
            { status: 500 }
        );
    }
}
