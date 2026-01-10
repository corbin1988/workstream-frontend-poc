import React from 'react';
import { Avatar } from 'flowbite-react';

interface TeamCard {
  key: string;
  name: string;
  count?: number;
  avatarUrl?: string;
}

interface TeamFilterProps {
  teams: TeamCard[];
  selected?: string | null;
  onSelect: (teamKey: string | null) => void;
}

export default function TeamFilter({ teams, selected, onSelect }: TeamFilterProps) {
  // generate a simple abstract SVG avatar (not a person) as a data URL
  const hash = (s: string) => s.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
  const svgAvatarDataUrl = (text: string, size = 64, seed = ''): string => {
    const initials = text.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    const h = Math.abs(hash(seed || text)) % 360;
    const bg = `hsl(${h} 60% 30%)`;
    const accent = `hsl(${(h + 40) % 360} 70% 45%)`;
    const r = Math.round(size * 0.18);
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>
        <defs>
          <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
            <stop offset='0' stop-color='${accent}' stop-opacity='0.95'/>
            <stop offset='1' stop-color='${bg}' stop-opacity='0.95'/>
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' fill='url(#g)' rx='${r}' ry='${r}' />
        <g fill='white' fill-opacity='0.12'>
          <circle cx='${size * 0.72}' cy='${size * 0.24}' r='${size * 0.28}' />
          <circle cx='${size * 0.28}' cy='${size * 0.68}' r='${size * 0.22}' />
        </g>
        <text x='50%' y='52%' font-family='Inter, Arial, Helvetica, sans-serif' font-size='${Math.round(size * 0.36)}' fill='white' text-anchor='middle' alignment-baseline='middle' font-weight='700'>${initials}</text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  return (
    <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden py-4 px-1">
      <div className="flex flex-nowrap items-center gap-2 w-max">
        {teams.map(team => {
          const isSelected = selected === team.key || selected === team.name;
          return (
            <button
              key={team.key}
              onClick={() => onSelect(isSelected ? null : team.key)}
              className={`flex items-center gap-3 min-w-[160px] px-4 py-2 rounded-full border transition-colors focus:outline-none ${isSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-md"
                  : "bg-gray-800/60 border-gray-700 text-gray-200 hover:bg-gray-700/60"
                }`}
            >
              <Avatar
                alt={team.name}
                img={team.avatarUrl || svgAvatarDataUrl(team.name, 64, team.key)}
                rounded
                size="sm"
                className="flex-shrink-0 ring-1 ring-white/5 bg-transparent"
              />
              <div className="min-w-0 text-left">
                <div className="font-medium text-sm truncate">{team.name}</div>
                {typeof team.count === "number" && (
                  <div className={`text-xs ${isSelected ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
                    {team.count} item{team.count !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

}
