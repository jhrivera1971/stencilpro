
import React, { useState, useMemo } from 'react';
import { StencilWork } from '../types';

interface RecentWorkProps {
  works: StencilWork[];
  onSelect: (work: StencilWork) => void;
}

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export const RecentWork: React.FC<RecentWorkProps> = ({ works, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Map of date strings to boolean (true = expanded)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Filter and Group Works
  const groupedWorks = useMemo(() => {
    // 1. Filter
    const filtered = works.filter(work => {
       const dateStr = new Date(work.createdAt).toLocaleDateString();
       const matchesSearch = 
         dateStr.includes(searchQuery) || 
         (work.style && work.style.toLowerCase().includes(searchQuery.toLowerCase()));
       return matchesSearch;
    });

    // 2. Sort Descending by time
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // 3. Group
    const groups: Record<string, StencilWork[]> = {};
    filtered.forEach(work => {
       const date = new Date(work.createdAt);
       const day = date.getDate();
       const year = date.getFullYear();
       const month = date.toLocaleString('default', { month: 'long' });
       // Format: "11 de October, 2025"
       const key = `${day} de ${month}, ${year}`;
       
       if (!groups[key]) {
           groups[key] = [];
       }
       groups[key].push(work);
    });

    return groups;
  }, [works, searchQuery]);

  // Initialize all groups as expanded on first load or when groups change
  // (Optional optimization: strictly usually done in useEffect, but simplified here)
  const groupKeys = Object.keys(groupedWorks);

  const toggleGroup = (groupKey: string) => {
      setExpandedGroups(prev => ({
          ...prev,
          [groupKey]: !(prev[groupKey] ?? true) // Default to true if undefined
      }));
  };

  if (works.length === 0) {
      return null; 
  }

  return (
    <div className="w-full mt-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <h2 className="text-2xl font-bold text-white">My Stencils</h2>
        <span className="text-xs text-zinc-500">{works.length} imágenes</span>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <SearchIcon />
           </div>
           <input 
             type="text" 
             placeholder="Buscar por estilo o fecha..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all placeholder-zinc-600"
           />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-900 transition-colors">
           <CalendarIcon />
           <span className="hidden sm:inline">Filtrar por fecha</span>
        </button>
      </div>

      {/* Groups */}
      <div className="space-y-4">
         {groupKeys.map(dateKey => {
             const groupWorks = groupedWorks[dateKey];
             const isExpanded = expandedGroups[dateKey] ?? true; // Default open

             return (
                 <div key={dateKey} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                    {/* Group Header */}
                    <button 
                        onClick={() => toggleGroup(dateKey)}
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1 rounded-md bg-zinc-800 text-zinc-400 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}>
                                <ChevronDownIcon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-white text-sm md:text-base">{dateKey}</span>
                        </div>
                        <span className="text-xs text-zinc-500 font-medium">
                            {groupWorks.length} {groupWorks.length === 1 ? 'imagen' : 'imágenes'}
                        </span>
                    </button>

                    {/* Group Content */}
                    {isExpanded && (
                        <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {groupWorks.map(work => (
                                <button
                                    key={work.id}
                                    onClick={() => onSelect(work)}
                                    className="group aspect-square bg-white rounded-lg overflow-hidden relative border border-zinc-700 hover:border-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <img 
                                        src={work.stencilImage} 
                                        alt="Stencil" 
                                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
             );
         })}
      </div>
      
      {groupKeys.length === 0 && searchQuery && (
          <div className="text-center py-12 text-zinc-500">
              No stencils found matching "{searchQuery}"
          </div>
      )}
    </div>
  );
};
