import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Welcome {session.user?.name}</h2>
          <p className="text-gray-600">
            Use the navigation above to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Track new activities</li>
            <li>Manage activity types</li>
            <li>View statistics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}