import { getServerSession } from 'next-auth/next';
import { sql } from '@vercel/postgres';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SkiStatsBoard from './ski-stats-board';

async function getStatsData() {
  try {
    // Get all activity types first
    const { rows: activityTypes } = await sql`
      SELECT name, description, points 
      FROM activity_types 
      ORDER BY points DESC, name
    `;

    // Get participant stats
    const { rows: leaderboard } = await sql`
      WITH participant_points AS (
        SELECT 
          p.name as participant_name,
          a.activity_type,
          at.points,
          COUNT(*) as activity_count,
          COUNT(*) * at.points as total_points
        FROM activities a
        JOIN participants p ON a.participant_id = p.id
        JOIN activity_types at ON a.activity_type = at.name
        GROUP BY p.name, a.activity_type, at.points
      )
      SELECT 
        participant_name,
        COALESCE(SUM(total_points), 0) as total_points,
        COALESCE(
          json_agg(
            json_build_object(
              'activity_type', activity_type,
              'count', activity_count,
              'points', points
            )
          ) FILTER (WHERE activity_type IS NOT NULL),
          '[]'
        ) as activities
      FROM participant_points
      GROUP BY participant_name
      ORDER BY total_points DESC
    `;

    const { rows: dailyStats } = await sql`
      SELECT 
        DATE(created_at)::text as date,
        COUNT(*) as total_activities,
        COALESCE(
          json_agg(
            json_build_object(
              'activity_type', activity_type,
              'participant_name', p.name
            )
          ) FILTER (WHERE activity_type IS NOT NULL),
          '[]'
        ) as activities
      FROM activities a
      JOIN participants p ON a.participant_id = p.id
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `;

    return {
      activityTypes,
      leaderboard,
      dailyStats
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      activityTypes: [],
      leaderboard: [],
      dailyStats: []
    };
  }
}

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const stats = await getStatsData();

  // Add console.log for debugging
  console.log('Stats data:', JSON.stringify(stats, null, 2));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Ski Trip Stats</h1>
      <SkiStatsBoard stats={stats} />
    </div>
  );
}