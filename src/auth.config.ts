import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const userWithRole = user as { id?: string; role?: string | null };
                if (userWithRole.id) {
                    token.id = userWithRole.id;
                }
                if (userWithRole.role) {
                    token.role = userWithRole.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                if (session.user) {
                    const sessionUser = session.user as typeof session.user & {
                        id?: string;
                        role?: string | null;
                    };
                    sessionUser.id = token.id as string;
                    sessionUser.role = token.role as string | null;
                }
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            // This is the built-in middleware logic from NextAuth
            // We can return true/false here to allow/deny access
            // But we are handling redirects manually in our custom middleware wrapper
            // So we can just return true here and let our middleware handle logic?
            // Or use this?
            // Since we are combining with next-intl, manual handling in middleware.ts is often clearer.
            return true;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
