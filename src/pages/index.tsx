import { Button } from "flowbite-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import Feed2 from "@/components/Feed2";
import Feed3 from "@/components/Feed3";
import Feed from "@/components/Feed";
import Feed4 from "@/components/Feed4";
import { useState, useMemo } from "react";
import Feed5, { mockData } from "@/components/Feed5";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import TeamFilter from "@/components/TeamFilter";
import Drawer from "@/components/Drawer";

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // static teams list (quick, guaranteed to render). 'ALL' will map to no filter.
  const teams = [
    { key: 'ALL', name: 'All Teams', count: mockData.tickets.length, avatarUrl: '' },
    { key: 'API', name: 'API Team', count: mockData.tickets.filter(t => t.team?.key === 'API').length, avatarUrl: '' },
    { key: 'INFRA', name: 'Infrastructure Team', count: mockData.tickets.filter(t => t.team?.key === 'INFRA').length, avatarUrl: '' },
    { key: 'DATA', name: 'Data Team', count: mockData.tickets.filter(t => t.team?.key === 'DATA').length, avatarUrl: '' },
  ];

  function handleSelect(teamKey: string | null) {
    // treat ALL as no filter
    if (!teamKey || teamKey === 'ALL') setSelectedTeam(null);
    else setSelectedTeam(teamKey);
  }
  return (
    <>
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="bg-gray-50 dark:bg-gray-900 antialiased h-screen overflow-hidden p-4">
        <div className="flex h-full gap-4">
          <LeftSidebar onRetrospectiveClick={() => setDrawerOpen(true)} />

          <main className="flex-1 bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto space-y-2">
            <TeamFilter teams={teams} selected={selectedTeam} onSelect={handleSelect} />
            <Feed5 selectedTeam={selectedTeam} />
          </main>

          <RightSidebar />
        </div>
      </div>
    </>
  );
}
