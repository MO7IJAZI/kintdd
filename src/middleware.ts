import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';

const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define paths that require authentication
  // We check if the path starts with /admin but exclude the login page itself
  const isAdminPath = nextUrl.pathname.includes('/admin');
  const isLoginPage = nextUrl.pathname.includes('/admin/login');

  if (isAdminPath && !isLoginPage && !isLoggedIn) {
    // Redirect unauthenticated users to login page
    // next-intl will handle the locale prefix if needed, but for safety we can construct absolute URL
    return Response.redirect(new URL('/admin/login', nextUrl));
  }

  // If authenticated and on login page, redirect to admin dashboard
  if (isLoginPage && isLoggedIn) {
    return Response.redirect(new URL('/admin', nextUrl));
  }

  // Allow next-intl to handle localization for all other requests
  return intlMiddleware(req);
});

export const config = {
  // Matcher ignoring internal Next.js paths and static files
  matcher: ['/((?!api|_next|.*\\..*).*)']
};