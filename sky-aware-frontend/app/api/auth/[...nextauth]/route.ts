import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import type { AuthResponse } from '@/types/user';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sky-aware.org/api';

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          // Call your backend API
          const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = (await res.json()) as AuthResponse;

          // Suppose backend returns { user: {...}, accessToken, refreshToken }
          if (data?.user && data?.token) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              accessToken: data.token,
            };
          }

          return null;
        } catch (e) {
          console.error('Auth error', e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial login
      if (user) {
        token.id = (user as any).id;
        token.name = (user as any).name;
        token.email = (user as any).email;
        token.accessToken = (user as any).token;
        token.user = user as any;
      }

      // TODO: Add refresh token rotation here if needed
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user = token.user as any;
      }
      session.accessToken = token.token as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret:
    process.env.NEXT_AUTH_SECRET ??
    'nRVEjSaxzqiSEN+HE6OEUrmbUw5qr2fzOTMivretWsg=',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
