// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

// Rate limiting setup
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

function checkLoginAttempts(email: string): boolean {
  const now = Date.now();
  const attempts = failedAttempts.get(email);

  // Reset if lockout time has passed
  if (attempts && (now - attempts.lastAttempt) > LOCKOUT_TIME) {
    failedAttempts.delete(email);
    return true;
  }

  // Block if too many attempts
  if (attempts && attempts.count >= MAX_FAILED_ATTEMPTS) {
    return false;
  }

  return true;
}

function recordFailedAttempt(email: string) {
  const attempts = failedAttempts.get(email);
  if (attempts) {
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
  } else {
    failedAttempts.set(email, { count: 1, lastAttempt: Date.now() });
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Check rate limiting
        if (!checkLoginAttempts(credentials.email)) {
          throw new Error('Too many failed attempts. Please try again later.');
        }

        try {
          // Find user by email
          const result = await sql`
            SELECT * FROM users 
            WHERE email = ${credentials.email.toLowerCase().trim()}
          `;
          
          const user = result.rows[0];

          if (!user) {
            recordFailedAttempt(credentials.email);
            throw new Error('Invalid email or password');
          }

          // Check password
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!passwordMatch) {
            recordFailedAttempt(credentials.email);
            throw new Error('Invalid email or password');
          }

          // Clear failed attempts on successful login
          failedAttempts.delete(credentials.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Custom error page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };