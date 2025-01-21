// src/app/dashboard/navbar.tsx
'use client';

import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  user: User;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="font-bold text-xl">
              Ski Trip Tracker
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/dashboard/activities" 
                className={isActive('/dashboard/activities')}
              >
                Activities
              </Link>
              <Link 
                href="/dashboard/activity-types" 
                className={isActive('/dashboard/activity-types')}
              >
                Activity Types
              </Link>
              <Link 
                href="/dashboard/stats" 
                className={isActive('/dashboard/stats')}
              >
                Stats
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user.email}</span>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}