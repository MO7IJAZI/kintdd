import { NextResponse } from 'next/server';
import { getCustomFonts, saveCustomFont, deleteCustomFont } from '@/lib/fontManager';
import { auth } from '@/auth';

/**
 * GET /api/fonts - List all active custom fonts
 */
export async function GET() {
    try {
        const fonts = await getCustomFonts();
        return NextResponse.json(fonts);
    } catch (error) {
        console.error('Error fetching fonts:', error);
        return NextResponse.json({ error: 'Failed to fetch fonts' }, { status: 500 });
    }
}

/**
 * POST /api/fonts - Save a new custom font to the database
 * Body: { name, url, fileName, fileSize, mimeType, displayName }
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            console.error('Unauthorized font upload attempt - no session found');
            return NextResponse.json({ error: 'Unauthorized - Please log in again' }, { status: 401 });
        }

        const body = await req.json();
        console.log('Font upload request body:', body);
        const { name, url, fileName, fileSize, mimeType, displayName } = body;
        
        if (!name || !url) {
            console.error('Missing required fields:', { name, url });
            return NextResponse.json({ error: 'Missing required fields: name, url' }, { status: 400 });
        }

        // Validate font name
        if (name.length < 2 || name.length > 100) {
            console.error('Invalid font name length:', name.length);
            return NextResponse.json({ error: 'Font name must be 2-100 characters' }, { status: 400 });
        }

        // Save to database
        const fonts = await saveCustomFont({
            name,
            url,
            fileName: fileName || '',
            fileSize: Number(fileSize) || 0,
            mimeType: mimeType || 'font/ttf',
            displayName: displayName || name,
        });

        return NextResponse.json(fonts);
    } catch (error: any) {
        console.error('Error saving font:', error);
        // Always include stack trace and details for debugging on VPS until resolved
        return NextResponse.json({ 
            error: 'Failed to save font', 
            details: error?.message || String(error),
            stack: error?.stack
        }, { status: 500 });
    }
}

/**
 * DELETE /api/fonts - Delete a custom font
 * Query: name=[fontName]
 */
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get('name');
        
        if (!name) {
            return NextResponse.json({ error: 'Missing required query parameter: name' }, { status: 400 });
        }

        const fonts = await deleteCustomFont(name);
        return NextResponse.json(fonts);
    } catch (error) {
        console.error('Error deleting font:', error);
        return NextResponse.json({ error: 'Failed to delete font' }, { status: 500 });
    }
}
