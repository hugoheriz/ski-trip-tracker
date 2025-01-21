import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar, Flag } from 'lucide-react';

interface ActivityType {
  name: string;
  description: string;
  points: number;
}

interface Activity {
  activity_type: string;
  count: number;
  points: number;
}

interface LeaderboardEntry {
  participant_name: string;
  total_points: number;
  activities: Activity[];
}

interface DailyStats {
  date: string;
  total_activities: number;
  activities: Array<{
    activity_type: string;
    participant_name: string;
  }>;
}

interface StatsProps {
  stats: {
    activityTypes: ActivityType[];
    leaderboard: LeaderboardEntry[];
    dailyStats: DailyStats[];
  };
}

const SkiStatsBoard: React.FC<StatsProps> = ({ stats }) => {
  // Group activity types by category
  const groupedActivities = {
    achievements: stats.activityTypes.filter(at => 
      ['blackDiamond', 'firstChair', 'jump'].includes(at.name)
    ),
    incidents: stats.activityTypes.filter(at => 
      ['wipeout', 'fall', 'yardSale', 'lostEquipment', 'goggleFog'].includes(at.name)
    ),
    basics: stats.activityTypes.filter(at => 
      ['Skiing', 'Snowboarding', 'Cross-Country', 'Backcountry'].includes(at.name)
    )
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Current Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.leaderboard.length > 0 ? (
            <div className="space-y-4">
              {stats.leaderboard.map((entry, index) => (
                <div key={entry.participant_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{entry.participant_name}</p>
                      {entry.activities.length > 0 && (
                        <p className="text-sm text-gray-500">
                          Latest: {entry.activities[0].activity_type}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xl font-bold">{entry.total_points} pts</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No activities recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-green-500" />
            Available Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Achievement Types */}
            <div>
              <h3 className="font-medium text-lg mb-3">Glory Awaits (Achievements)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedActivities.achievements.map(activity => (
                  <div key={activity.name} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{activity.name}</h4>
                      <span className="text-sm text-purple-600 font-medium">
                        {activity.points} pts
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Types */}
            <div>
              <h3 className="font-medium text-lg mb-3">Style Points (Incidents)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedActivities.incidents.map(activity => (
                  <div key={activity.name} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{activity.name}</h4>
                      <span className="text-sm text-purple-600 font-medium">
                        {activity.points} pts
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today&apos;s Activity */}
      {stats.dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Today&apos;s Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.dailyStats[0].activities.length > 0 ? (
              <div className="space-y-2">
                {stats.dailyStats[0].activities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{activity.participant_name}</span>
                    <span className="text-gray-600">{activity.activity_type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No activities recorded today</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkiStatsBoard;