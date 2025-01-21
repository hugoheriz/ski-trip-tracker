// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { headers } from 'next/headers';

// Rate limiting
const RATE_LIMIT_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_REGISTRATION_ATTEMPTS = 5;
const registrationAttempts = new Map<string, { count: number; timestamp: number }>();

function checkRegistrationLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = registrationAttempts.get(ip);

  if (!attempts || (now - attempts.timestamp) > RATE_LIMIT_DURATION) {
    registrationAttempts.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (attempts.count >= MAX_REGISTRATION_ATTEMPTS) {
    return false;
  }

  attempts.count++;
  return true;
}

// Input validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = headers().get('x-forwarded-for') || 'unknown';
    if (!checkRegistrationLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { name, email, password } = await request.json();

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}
    `;

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Use a transaction for user and participant creation
    const result = await sql.begin(async (sql) => {
      // Insert user
      const userResult = await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES (${name}, ${email.toLowerCase().trim()}, ${password_hash})
        RETURNING id
      `;

      // Create participant record
      await sql`
        INSERT INTO participants (user_id, name)
        VALUES (${userResult.rows[0].id}, ${name})
      `;

      return userResult.rows[0];
    });

    return NextResponse.json(
      { success: true, userId: result.id },
      { status: 201 }
    );

  } catch (error) {
    // Log the error but don't send detailed error info to client
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}