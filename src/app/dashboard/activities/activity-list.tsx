// src/app/dashboard/activities/activity-list.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Activity {
  id: string;
  date: string;
  activity_type: string;
  location: string;
}

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities: initialActivities }: ActivityListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Memoize activity types to prevent recalculation on every render
  const activityTypes = useMemo(() => 
    Array.from(new Set(initialActivities.map(a => a.activity_type))),
    [initialActivities]
  );

  // Memoize filtered activities
  const filteredActivities = useMemo(() => 
    initialActivities.filter(activity => {
      const matchesSearch = 
        activity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activity_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = 
        filterType === 'all' || 
        activity.activity_type.toLowerCase() === filterType.toLowerCase();
      
      return matchesSearch && matchesType;
    }),
    [initialActivities, searchTerm, filterType]
  );

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Input
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {activityTypes.map((type) => (
              <SelectItem key={type} value={type.toLowerCase()}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  {initialActivities.length === 0 
                    ? "No activities recorded yet"
                    : "No activities match your search"}
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {new Date(activity.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{activity.activity_type}</TableCell>
                  <TableCell>{activity.location}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}