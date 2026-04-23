import { NextResponse } from 'next/server';
import { getFontCssDeclarations } from '@/lib/fontManager';

/**
 * GET /api/fonts/css - Get @font-face CSS declarations for all active custom fonts
 * Used for server-side rendering and styling
 */
export async function GET() {
    try {
        const css = await getFontCssDeclarations();
        return new NextResponse(css, {
            headers: {
                'Content-Type': 'text/css; charset=utf-8',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('Error generating font CSS:', error);
        return new NextResponse('', {
            headers: {
                'Content-Type': 'text/css; charset=utf-8',
            },
        });
    }
}
