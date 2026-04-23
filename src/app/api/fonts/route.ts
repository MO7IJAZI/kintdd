import { NextResponse } from 'next/server';
import { getCustomFonts, saveCustomFont, deleteCustomFont } from '@/lib/fontManager';
import { auth } from '@/auth';

export async function GET() {
    const fonts = await getCustomFonts();
    return NextResponse.json(fonts);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, url } = await req.json();
        if (!name || !url) return NextResponse.json({ error: 'Missing name or url' }, { status: 400 });
        const fonts = await saveCustomFont({ name, url });
        return NextResponse.json(fonts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save font' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get('name');
        if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
        const fonts = await deleteCustomFont(name);
        return NextResponse.json(fonts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete font' }, { status: 500 });
    }
}
