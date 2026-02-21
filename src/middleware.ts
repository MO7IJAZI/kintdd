import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // Legacy Vite check from original proxy configuration
    if (req.nextUrl.pathname === '/@vite/client') {
        return new NextResponse('export {};', {
            status: 200,
            headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
        });
    }

    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const path = nextUrl.pathname;

    // Admin protection logic
    // Check for admin routes (e.g. /en/admin, /ar/admin)
    // We use a regex to ensure we match exactly the admin section and handle locales correctly
    const isAdminRoute = /^\/(en|ar)\/admin(\/|$)/.test(path);
    const isLoginRoute = /^\/(en|ar)\/admin\/login(\/|$)/.test(path);

    if (isAdminRoute) {
        if (!isLoggedIn && !isLoginRoute) {
            // Redirect to login, preserving the locale
            const locale = path.split('/')[1] || 'en';
            return NextResponse.redirect(new URL(`/${locale}/admin/login`, nextUrl));
        }
        
        if (isLoggedIn && isLoginRoute) {
             // Redirect to admin dashboard, preserving the locale
             const locale = path.split('/')[1] || 'en';
             return NextResponse.redirect(new URL(`/${locale}/admin`, nextUrl));
        }
    }

    return intlMiddleware(req);
});

export const config = {
    // Matcher ignoring internal Next.js paths, static files, and vercel internals
    matcher: ['/@vite/client', '/((?!api|_next|_vercel|.*\\..*).*)']
};