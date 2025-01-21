import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent activities
    const { rows: activities } = await sql`
      SELECT 
        a.id,
        a.created_at,
        a.activity_type,
        p.name as participant_name,
        u.name as spotter_name
      FROM activities a
      JOIN participants p ON a.participant_id = p.id
      JOIN users u ON a.spotter_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `;

    // Get all unique activity types
    const { rows: activityTypes } = await sql`
      SELECT 
        id,
        name,
        description,
        points
      FROM activity_types
      ORDER BY name;
    `;

    return NextResponse.json({
      activities,
      activityTypes
    });
  } catch (error) {
    console.error('Debug query error:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}