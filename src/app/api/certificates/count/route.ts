import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const count = await prisma.certificate.count({ where: { isActive: true } });
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error counting certificates:', error);
        return NextResponse.json({ error: 'Failed to count certificates' }, { status: 500 });
    }
}
