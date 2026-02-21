import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: "/admin/login",
    },
    session: {
        strategy: "jwt",
    },
    trustHost: true,
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
            return true;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
