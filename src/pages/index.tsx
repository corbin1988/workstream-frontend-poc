import { Button } from "flowbite-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import Feed2 from "@/components/Feed2";
import Feed3 from "@/components/Feed3";
import Feed from "@/components/Feed";
import Feed4 from "@/components/Feed4";
import { useState, useMemo } from "react";
import Feed5 from "@/components/Feed5";
import RightSidebar from "@/components/RightSidebar";
import TeamFilter from "@/components/TeamFilter";
import mockWorkData from "@/data/mockWorkData.json";

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // static teams list (quick, guaranteed to render). 'ALL' will map to no filter.
  const teams = [
    { key: 'ALL', name: 'All Teams', count: mockWorkData.tickets.length, avatarUrl: '' },
    { key: 'API', name: 'API Team', count: mockWorkData.tickets.filter(t => t.team?.key === 'API').length, avatarUrl: '' },
    { key: 'INFRA', name: 'Infrastructure Team', count: mockWorkData.tickets.filter(t => t.team?.key === 'INFRA').length, avatarUrl: '' },
    { key: 'DATA', name: 'Data Team', count: mockWorkData.tickets.filter(t => t.team?.key === 'DATA').length, avatarUrl: '' },
    { key: 'FRONTEND', name: 'Frontend Team', count: 5, avatarUrl: '' },
    { key: 'MOBILE', name: 'Mobile Team', count: 8, avatarUrl: '' },
    { key: 'DESIGN', name: 'Design Team', count: 3, avatarUrl: '' },
    { key: 'QA', name: 'QA Team', count: 12, avatarUrl: '' },
    { key: 'SECURITY', name: 'Security Team', count: 4, avatarUrl: '' },
  ];

  function handleSelect(teamKey: string | null) {
    // treat ALL as no filter
    if (!teamKey || teamKey === 'ALL') setSelectedTeam(null);
    else setSelectedTeam(teamKey);
  }
  return (
    <>
      <main className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-900 lg:ml-64 xl:mr-96 px-2 sm:px-4 md:px-6 lg:px-8 pt-4 pb-20 space-y-2 overscroll-none max-w-4xl lg:max-w-none">
        <TeamFilter teams={teams} selected={selectedTeam} onSelect={handleSelect} />
        <Feed5 selectedTeam={selectedTeam} />
      </main>
      <RightSidebar />
    </>
  );
}
