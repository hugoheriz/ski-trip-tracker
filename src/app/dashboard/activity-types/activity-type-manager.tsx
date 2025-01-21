'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Save, Edit2 } from 'lucide-react';

interface ActivityType {
  id: string;
  name: string;
  description?: string;
  points?: number;
}

export default function ActivityTypeManager() {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [newType, setNewType] = useState({ name: '', description: '', points: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load existing activity types
  useEffect(() => {
    const loadActivityTypes = async () => {
      try {
        const response = await fetch('/api/activity-types');
        if (response.ok) {
          const data = await response.json();
          setActivityTypes(data);
        }
      } catch {
        console.error('Failed to load activity types');
      }
    };
    loadActivityTypes();
  }, []);

  const handleAdd = async () => {
    if (!newType.name.trim()) {
      setError('Activity type name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/activity-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newType.name,
          description: newType.description,
          points: newType.points ? parseInt(newType.points) : null
        })
      });

      if (response.ok) {
        const added = await response.json();
        setActivityTypes([...activityTypes, added]);
        setNewType({ name: '', description: '', points: '' });
        setError('');
      }
    } catch {
      setError('Failed to add activity type');
    }
    setIsLoading(false);
  };

  const handleEdit = async (id: string) => {
    const type = activityTypes.find(t => t.id === id);
    if (!type) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/activity-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type)
      });

      if (response.ok) {
        setEditingId(null);
        setError('');
      }
    } catch {
      setError('Failed to update activity type');
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity type?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/activity-types/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setActivityTypes(activityTypes.filter(type => type.id !== id));
      }
    } catch {
      setError('Failed to delete activity type');
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Add new activity type form */}
          <div className="flex gap-4">
            <Input
              placeholder="Activity Type Name"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newType.description}
              onChange={(e) => setNewType({ ...newType, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Points (optional)"
              value={newType.points}
              onChange={(e) => setNewType({ ...newType, points: e.target.value })}
              className="w-32"
            />
            <Button onClick={handleAdd} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Activity types table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>
                    {editingId === type.id ? (
                      <Input
                        value={type.name}
                        onChange={(e) => setActivityTypes(types =>
                          types.map(t => t.id === type.id ? { ...t, name: e.target.value } : t)
                        )}
                      />
                    ) : type.name}
                  </TableCell>
                  <TableCell>
                    {editingId === type.id ? (
                      <Input
                        value={type.description || ''}
                        onChange={(e) => setActivityTypes(types =>
                          types.map(t => t.id === type.id ? { ...t, description: e.target.value } : t)
                        )}
                      />
                    ) : type.description}
                  </TableCell>
                  <TableCell>
                    {editingId === type.id ? (
                      <Input
                        type="number"
                        value={type.points || ''}
                        onChange={(e) => setActivityTypes(types =>
                          types.map(t => t.id === type.id ? { ...t, points: parseInt(e.target.value) } : t)
                        )}
                        className="w-32"
                      />
                    ) : type.points}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingId === type.id ? (
                        <Button size="sm" onClick={() => handleEdit(type.id)} disabled={isLoading}>
                          <Save className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setEditingId(type.id)} disabled={isLoading}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(type.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}