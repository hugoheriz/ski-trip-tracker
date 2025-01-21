import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sql } from '@vercel/postgres';
import { AddActivityForm } from './add-activity-form';

async function getActivityTypes() {
  const { rows } = await sql`SELECT * FROM activity_types`;
  return rows;
}

async function getParticipants() {
  const { rows } = await sql`SELECT * FROM participants`;
  return rows;
}

export default async function NewActivityPage() {
  const session = await getServerSession(authOptions);
  const [activityTypes, participants] = await Promise.all([
    getActivityTypes(),
    getParticipants(),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Add New Activity</h1>
      <AddActivityForm
        userId={session?.user?.id || ''}
        activityTypes={activityTypes}
        participants={participants}
      />
    </div>
  );
}