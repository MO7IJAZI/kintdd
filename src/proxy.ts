import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';
import { NextResponse, type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(req: NextRequest) {
    if (req.nextUrl.pathname === '/@vite/client') {
        return new NextResponse('export {};', {
            status: 200,
            headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
        });
    }
    return intlMiddleware(req);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/@vite/client', '/((?!api|_next|_vercel|.*\\..*|.*@.*).*)']
};
