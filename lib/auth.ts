import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './db';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            role: 'ADMIN' | 'COORDINATOR';
        };
    }
    interface User {
        role: 'ADMIN' | 'COORDINATOR';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: 'ADMIN' | 'COORDINATOR';
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,

    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),

        // Credentials Provider (Email/Password)
        CredentialsProvider({
            name: 'Şirket Hesabı',
            credentials: {
                email: { label: 'E-posta', type: 'email', placeholder: 'ornek@sirket.com' },
                password: { label: 'Şifre', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('E-posta ve şifre gereklidir');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error('Geçersiz e-posta veya şifre');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Geçersiz e-posta veya şifre');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    callbacks: {
        async signIn({ user, account }) {
            // For OAuth, check if user exists and assign default role
            if (account?.provider === 'google') {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                });

                if (!existingUser) {
                    // Check if this is the first user (make them admin)
                    const userCount = await prisma.user.count();
                    const role = userCount === 0 ? 'ADMIN' : 'COORDINATOR';

                    await prisma.user.create({
                        data: {
                            email: user.email!,
                            name: user.name!,
                            image: user.image,
                            role: role,
                        },
                    });
                }
            }
            return true;
        },

        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }

            // Handle session update
            if (trigger === 'update' && session) {
                token.name = session.name;
            }

            // Fetch latest role from DB
            if (token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    select: { id: true, role: true },
                });
                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },

    events: {
        async signIn({ user, account }) {
            // Log sign-in event
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'LOGIN',
                    entity: 'User',
                    entityId: user.id,
                    newValue: { provider: account?.provider || 'credentials' },
                },
            });
        },
    },
};
