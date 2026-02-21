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
    // We check if the path contains '/admin' but exclude '/admin/login'
    // This covers /en/admin, /ar/admin, /admin, etc.
    const isAdminSection = path.includes('/admin');
    const isLoginPage = path.includes('/login');

    if (isAdminSection && !isLoginPage) {
        if (!isLoggedIn) {
            // Redirect to login, preserving the locale
            // Extract locale from path (e.g., /en/...) or default to 'en'
            const segments = path.split('/');
            const locale = (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'ar')) ? segments[1] : 'en';
            return NextResponse.redirect(new URL(`/${locale}/admin/login`, nextUrl));
        }
    }

    // Redirect logged-in users away from login page
    // We must ensure we don't cause a redirect loop if the user is ALREADY at /admin
    if (isLoginPage && isLoggedIn) {
         const segments = path.split('/');
         const locale = (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'ar')) ? segments[1] : 'en';
         return NextResponse.redirect(new URL(`/${locale}/admin`, nextUrl));
    }

    return intlMiddleware(req);
});

export const config = {
    // Matcher ignoring internal Next.js paths, static files, and vercel internals
    // We want to match /en/admin, /admin, etc.
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};