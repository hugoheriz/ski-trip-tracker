// src/app/api/activity-types/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rows } = await sql`
      SELECT * FROM activity_types 
      ORDER BY name ASC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch activity types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity types' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, points } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Activity type name is required' },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      INSERT INTO activity_types (name, description, points)
      VALUES (${name}, ${description || null}, ${points || null})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create activity type:', error);
    return NextResponse.json(
      { error: 'Failed to create activity type' },
      { status: 500 }
    );
  }
}
