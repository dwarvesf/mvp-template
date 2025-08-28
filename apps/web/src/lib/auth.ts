import { NextAuthOptions } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // Remove min validation here as it's handled by the API
});

export const authOptions: NextAuthOptions = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          const { email, password } = credentialsSchema.parse(credentials);

          // Use API_URL or NEXT_PUBLIC_API_URL for server-side
          const apiUrl =
            process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          const loginUrl = `${apiUrl}/auth/login`;
          console.log('Attempting login to:', loginUrl);
          console.log('With email:', email);

          const res = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          console.log('Response status:', res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.log('Login failed:', errorText);
            return null;
          }

          const data = await res.json();
          console.log('Login successful, user:', data.user.email);

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.accessToken,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'accessToken' in user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
};
