// src/app/dashboard/activities/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sql } from '@vercel/postgres';
import { ActivityList } from './activity-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getActivities(userId: string) {
  const { rows } = await sql`
    SELECT 
      a.id,
      a.created_at as date,
      a.activity_type,
      p.name as location
    FROM activities a
    JOIN participants p ON a.participant_id = p.id
    WHERE a.spotter_id = ${userId}
    ORDER BY a.created_at DESC
  `;
  return rows;
}

export default async function ActivitiesPage() {
  const session = await getServerSession(authOptions);
  const activities = await getActivities(session?.user?.id || '');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activities</h1>
        <Link href="/dashboard/activities/new">
          <Button>Add Activity</Button>
        </Link>
      </div>
      <ActivityList activities={activities} />
    </div>
  );
}