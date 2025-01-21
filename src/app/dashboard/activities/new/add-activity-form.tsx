// src/app/dashboard/activities/new/add-activity-form.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddActivityFormProps {
  spotterId: string;
  participants: Array<{ id: string; name: string }>;
}

const ACTIVITY_TYPES = [
  'Skiing',
  'Snowboarding',
  'Cross-Country',
  'Backcountry'
] as const;

export function AddActivityForm({
  spotterId,
  participants,
}: AddActivityFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    activityType: '',
    participantId: '',
  });

  const isFormValid = formData.activityType && formData.participantId;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError('Please select both an activity type and location');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          spotterId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add activity');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/activities');
        router.refresh();
      }, 1000); // Short delay to show success message

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, spotterId, router, isFormValid]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600">
                Activity added successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Select
              value={formData.activityType}
              onValueChange={(value) =>
                setFormData({ ...formData, activityType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Select
              value={formData.participantId}
              onValueChange={(value) =>
                setFormData({ ...formData, participantId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((participant) => (
                  <SelectItem key={participant.id} value={participant.id}>
                    {participant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Adding...' : 'Add Activity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}