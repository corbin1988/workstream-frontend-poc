import { useState } from "react";
import ActivityFeed from "@/components/ActivityFeed";
import TeamFilter from "@/components/TeamFilter";
import RightSidebar from "@/components/RightSidebar";
import mockActivityData from "@/data/mockActivityData.json";

interface TeamCard {
  key: string;
  name: string;
  count?: number;
}

export default function ActivityFeedPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Calculate activity counts per team
  const teams: TeamCard[] = mockActivityData.teams.map(team => ({
    key: team.key,
    name: team.name,
    count: mockActivityData.activities.filter(a => a.team === team.name).length
  }));

  return (
    <>
      <main className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-900 lg:ml-64 xl:mr-96 px-2 sm:px-4 md:px-6 lg:px-8 pt-4 pb-20 space-y-2 overscroll-none max-w-4xl lg:max-w-none">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Activity Feed
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time stream of engineering work across your teams
          </p>
        </div>

        {/* Team Filter */}
        <TeamFilter
          teams={teams}
          selected={selectedTeam}
          onSelect={setSelectedTeam}
        />

        {/* Activity Feed */}
        <ActivityFeed selectedTeam={selectedTeam} />
      </main>
      <RightSidebar />
    </>
  );
}
