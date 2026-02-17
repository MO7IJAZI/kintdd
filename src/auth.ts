import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const admin = await prisma.admin.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!admin) return null;

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    admin.password
                );

                if (!isPasswordValid) return null;

                return {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                };
            },
        }),
    ],
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
    },
});
