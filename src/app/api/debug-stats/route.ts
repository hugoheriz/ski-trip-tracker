import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const ACTIVITY_TYPES = [
  { name: 'wipeout', description: 'Epic wipeout', points: 2 },
  { name: 'firstChair', description: 'First one on the chairlift', points: 2 },
  { name: 'blackDiamond', description: 'Complete a black diamond run', points: 3 },
  { name: 'jump', description: 'Hit a jump', points: 2 },
  { name: 'fall', description: 'Fall down while skiing', points: 1 },
  { name: 'lodge', description: 'First at the lodge', points: 1 },
  { name: 'lostEquipment', description: 'Lost a ski/pole/etc', points: 2 },
  { name: 'yardSale', description: 'Lost multiple pieces of equipment', points: 3 },
  { name: 'goggleFog', description: 'Completely fogged goggles', points: 1 }
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add activity types
    for (const type of ACTIVITY_TYPES) {
      await sql`
        INSERT INTO activity_types (name, description, points)
        VALUES (${type.name}, ${type.description}, ${type.points})
        ON CONFLICT (name) DO UPDATE 
        SET description = ${type.description},
            points = ${type.points}
      `;
    }

    const { rows: activityTypes } = await sql`
      SELECT * FROM activity_types ORDER BY name;
    `;

    return NextResponse.json({
      message: 'Activity types updated successfully',
      activityTypes
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}