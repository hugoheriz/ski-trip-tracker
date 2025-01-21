// src/app/dashboard/activity-types/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ActivityTypeManager from './activity-type-manager';

export default async function ActivityTypesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Activity Types</h1>
      <ActivityTypeManager />
    </div>
  );
}