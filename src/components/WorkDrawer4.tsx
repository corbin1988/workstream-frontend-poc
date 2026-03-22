import React, { useState } from 'react';
import Link from 'next/link';

interface WorkItem {
  key: string;
  title: string;
  intent?: string;
  hasChanges?: boolean;
  whyHere?: string;
  triaged?: boolean;
}

export interface ProjectItems {
  projectKey: string;
  projectName: string;
  activeInProgress: WorkItem[];
  suggested?: Array<WorkItem & { reason: string }>;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  projects?: ProjectItems[];
  continueFromYesterday?: WorkItem[];
  activeInProgress?: WorkItem[];
  suggested?: Array<WorkItem & { reason: string }>;
}

// Sample data based on work review spec
const sampleContinueFromYesterday: WorkItem[] = [
  {
    key: 'ABC-123',
    title: 'Add authentication endpoint for mobile clients',
    intent: 'Enable mobile app users to authenticate securely',
    hasChanges: true,
  },
  {
    key: 'ABC-140',
    title: 'Refactor user permissions module',
    intent: 'Simplify permission logic and reduce technical debt',
    hasChanges: false,
  },
];

const sampleActiveInProgress: WorkItem[] = [
  {
    key: 'ABC-156',
    title: 'Fix dashboard loading performance',
    intent: 'Reduce initial page load time for analytics dashboard',
    whyHere: 'Assigned to you yesterday',
  },
];

const sampleSuggested: Array<WorkItem & { reason: string }> = [
  {
    key: 'ABC-178',
    title: 'Update API documentation',
    reason: 'You recently committed to related files',
  },
  {
    key: 'ABC-201',
    title: 'Review security audit findings',
    reason: 'Tagged for your review by security team',
  },
];



export default function WorkDrawer2({ 
  isOpen, 
  onClose,
  loading = false,
  projects,
  continueFromYesterday = [],
  activeInProgress = [],
  suggested = []
}: DrawerProps) {
  const [expandedSuggested, setExpandedSuggested] = useState(false);
  const [workItems, setWorkItems] = useState<Record<string, { status: string; note: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Assignee');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  // Track items added manually so we never shadow incoming prop updates
  const [addedContinueItems, setAddedContinueItems] = useState<WorkItem[]>([]);
  const [addedActiveItems, setAddedActiveItems] = useState<WorkItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Multi-project derived values
  const allProjectActiveItems = projects?.flatMap(p => p.activeInProgress) ?? [];
  const allProjectSuggested = projects?.flatMap(p => p.suggested ?? []) ?? [];
  const hasTabs = (projects?.length ?? 0) >= 2;
  const tabProject = hasTabs && activeTab !== 'all'
    ? (projects?.find(p => p.projectKey === activeTab) ?? null)
    : null;

  const continueItems = [...continueFromYesterday, ...addedContinueItems];
  const activeItems = projects
    ? [...(tabProject ? tabProject.activeInProgress : allProjectActiveItems), ...addedActiveItems]
    : [...activeInProgress, ...addedActiveItems];
  const displayedSuggested = projects
    ? (tabProject ? (tabProject.suggested ?? []) : allProjectSuggested)
    : suggested;

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleAction = (itemKey: string, action: string) => {
    setWorkItems(prev => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], status: action }
    }));
  };

  const handleNote = (itemKey: string, note: string) => {
    setWorkItems(prev => ({
      ...prev,
      [itemKey]: { ...prev[itemKey], note }
    }));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSearchOverlayOpen(value.length > 0);
  };

  const handleAddWorkItem = (item: { key: string; title: string; context?: string }) => {
    const newItem: WorkItem = {
      key: item.key,
      title: item.title,
      whyHere: 'Added manually',
    };

    if (continueItems.length > 0) {
      setAddedContinueItems(prev => [...prev, newItem]);
    } else {
      setAddedActiveItems(prev => [...prev, newItem]);
    }

    setSearchOverlayOpen(false);
    setSearchQuery('');
    setHighlightedKey(item.key);
    setTimeout(() => setHighlightedKey(null), 2000);
  };

  const handleCloseSearchOverlay = () => {
    setSearchOverlayOpen(false);
  };

  // Filter search results based on query, using items from props
  const getFilteredResults = () => {
    if (!searchQuery) return { exact: [], likely: [], other: [] };

    const query = searchQuery.toLowerCase();

    // Build a pool from suggested items not already in active/continue lists
    const activeKeys = new Set([
      ...continueItems.map(i => i.key),
      ...activeItems.map(i => i.key),
    ]);
    const pool = displayedSuggested
      .filter(i => !activeKeys.has(i.key))
      .map(i => ({ key: i.key, title: i.title, context: i.reason }));

    const exact = pool.filter(
      item => item.key.toLowerCase() === query
    );
    const exactKeys = new Set(exact.map(i => i.key));
    const likely = pool.filter(
      item =>
        !exactKeys.has(item.key) &&
        (item.key.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query))
    );
    const likelyKeys = new Set(likely.map(i => i.key));
    const other = pool
      .filter(item => !exactKeys.has(item.key) && !likelyKeys.has(item.key))
      .slice(0, 2);

    return { exact, likely, other };
  };

  const searchResults = getFilteredResults();
  const hasResults = searchResults.exact.length > 0 || 
                     searchResults.likely.length > 0 || 
                     searchResults.other.length > 0;

  const categories = ['Assignee', 'Reporter', 'Status', 'Priority', 'Team'];

  const untriagedCount = [...continueItems, ...activeItems].filter(
    item => !workItems[item.key]?.status
  ).length;

  const renderWorkItemRow = (item: WorkItem, showWhyHere = false) => (
    <div 
      key={item.key} 
      className={`py-3 border-b border-gray-200 dark:border-gray-700 space-y-2 transition-colors ${
        highlightedKey === item.key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
              {item.key}
            </span>
            <span className="text-sm text-gray-900 dark:text-white truncate">
              {item.title}
            </span>
          </div>
          {item.intent && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {item.intent}
            </p>
          )}
          {showWhyHere && item.whyHere && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
              {item.whyHere}
            </p>
          )}
          {item.hasChanges !== undefined && (
            <span className={`text-xs mt-1 inline-block ${
              item.hasChanges 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-500'
            }`}>
              {item.hasChanges ? 'Changed since last review' : 'No changes'}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => handleAction(item.key, 'keep')}
          className={`text-xs px-2.5 py-1 rounded ${
            workItems[item.key]?.status === 'keep'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Keep working
        </button>
        <button
          type="button"
          onClick={() => handleAction(item.key, 'done')}
          className={`text-xs px-2.5 py-1 rounded ${
            workItems[item.key]?.status === 'done'
              ? 'bg-green-600 text-white'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Done
        </button>
        <button
          type="button"
          onClick={() => handleAction(item.key, 'blocked')}
          className={`text-xs px-2.5 py-1 rounded ${
            workItems[item.key]?.status === 'blocked'
              ? 'bg-yellow-600 text-white'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Blocked
        </button>
        <button
          type="button"
          onClick={() => handleAction(item.key, 'notmine')}
          className={`text-xs px-2.5 py-1 rounded ${
            workItems[item.key]?.status === 'notmine'
              ? 'bg-gray-600 text-white'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Not mine
        </button>
        <button
          type="button"
          onClick={() => {
            const note = prompt('Add a note:');
            if (note) handleNote(item.key, note);
          }}
          className="text-xs px-2.5 py-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Add note
        </button>
      </div>

      {workItems[item.key]?.note && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
          {workItems[item.key].note}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] transition-opacity backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer component */}
      <div
        id="work-review-drawer"
        className={`fixed top-0 right-0 z-[70] w-full h-screen max-w-2xl overflow-y-auto transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-white dark:bg-gray-800`}
        tabIndex={-1}
        aria-labelledby="drawer-label"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-4 right-4 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
            <h5 id="drawer-label" className="text-xl font-semibold text-gray-900 dark:text-white">
              Daily Review
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {today}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Review and update if anything looks wrong or has changed.
            </p>

            {/* Add Work - Search Input */}
            <form className="mt-4 relative" onSubmit={(e) => e.preventDefault()}>
              <div className="flex shadow-sm rounded-lg -space-x-0.5">
                <label htmlFor="search-dropdown" className="block mb-2.5 text-sm font-medium sr-only">Search Work Items</label>
                <button 
                  id="dropdown-button" 
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center shrink-0 z-10 text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 font-medium rounded-l-lg text-sm px-4 py-2.5"
                >
                  <svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.143 4H4.857A.857.857 0 0 0 4 4.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 10 9.143V4.857A.857.857 0 0 0 9.143 4Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 20 9.143V4.857A.857.857 0 0 0 19.143 4Zm-10 10H4.857a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286A.857.857 0 0 0 9.143 14Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286a.857.857 0 0 0-.857-.857Z"/>
                  </svg>
                  {selectedCategory}
                  <svg className="w-4 h-4 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute mt-12 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-44">
                    <ul className="p-2 text-sm text-gray-700 dark:text-gray-300 font-medium" aria-labelledby="dropdown-button">
                      {categories.map(category => (
                        <li key={category}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category);
                              setDropdownOpen(false);
                            }}
                            className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md"
                          >
                            {category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <input 
                  type="search" 
                  id="search-dropdown" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.length > 0 && setSearchOverlayOpen(true)}
                  onBlur={(e) => {
                    // Delay to allow click events on overlay items
                    const currentTarget = e.currentTarget;
                    setTimeout(() => {
                      if (currentTarget && !currentTarget.contains(document.activeElement)) {
                        handleCloseSearchOverlay();
                      }
                    }, 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleCloseSearchOverlay();
                    }
                  }}
                  className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm block w-full placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-r-lg" 
                  placeholder="Search for work items" 
                  required 
                />
              </div>

              {/* Search Results Overlay */}
              {searchOverlayOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {hasResults ? (
                    <>
                      {/* Exact Match */}
                      {searchResults.exact.length > 0 && (
                        <div>
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900">
                            <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Exact Match</h6>
                          </div>
                          {searchResults.exact.map(item => (
                            <div key={item.key} className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                    {item.key}
                                  </span>
                                  <span className="text-sm text-gray-900 dark:text-white truncate">
                                    {item.title}
                                  </span>
                                </div>
                                {item.context && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                    {item.context}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddWorkItem(item)}
                                className="shrink-0 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Likely */}
                      {searchResults.likely.length > 0 && (
                        <div>
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900">
                            <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Likely</h6>
                          </div>
                          {searchResults.likely.map(item => (
                            <div key={item.key} className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                    {item.key}
                                  </span>
                                  <span className="text-sm text-gray-900 dark:text-white truncate">
                                    {item.title}
                                  </span>
                                </div>
                                {item.context && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                    {item.context}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddWorkItem(item)}
                                className="shrink-0 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Other Results */}
                      {searchResults.other.length > 0 && (
                        <div>
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900">
                            <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Other Results</h6>
                          </div>
                          {searchResults.other.map(item => (
                            <div key={item.key} className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                    {item.key}
                                  </span>
                                  <span className="text-sm text-gray-900 dark:text-white truncate">
                                    {item.title}
                                  </span>
                                </div>
                                {item.context && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                    {item.context}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddWorkItem(item)}
                                className="shrink-0 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                      No matching work found. Check the ticket key or paste a URL.
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Project Tabs */}
          {hasTabs && (
            <div className={`border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all ${
              searchOverlayOpen ? 'blur-sm brightness-75' : ''
            }`}>
              <div className="flex overflow-x-auto px-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                    activeTab === 'all'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                {projects?.map(p => (
                  <button
                    key={p.projectKey}
                    type="button"
                    onClick={() => setActiveTab(p.projectKey)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                      activeTab === p.projectKey
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {p.projectName || p.projectKey}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 overflow-y-auto px-6 py-4 transition-all ${
            searchOverlayOpen ? 'blur-sm brightness-75' : ''
          }`}>

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500 dark:text-gray-400">
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-sm">Loading your Jira issues…</span>
              </div>
            )}

            {/* Continue from Yesterday */}
            {continueItems.length > 0 && (
              <div className="mb-6">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Continue from Yesterday
                </h6>
                <div className="space-y-0">
                  {continueItems.map(item => renderWorkItemRow(item))}
                </div>
              </div>
            )}

            {/* Active / In Progress */}
            {activeItems.length > 0 && (
              <div className="mb-6">
                <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Active / In Progress
                </h6>
                <div className="space-y-0">
                  {activeItems.map(item => renderWorkItemRow(item, true))}
                </div>
              </div>
            )}

            {/* Suggested (Collapsed) */}
            {displayedSuggested.length > 0 && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setExpandedSuggested(!expandedSuggested)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-white mb-3 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <span>Suggested ({displayedSuggested.length})</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedSuggested ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSuggested && (
                  <div className="space-y-0">
                    {displayedSuggested.map(item => (
                      <div key={item.key} className="py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                {item.key}
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white truncate">
                                {item.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            className="text-xs px-2.5 py-1 rounded text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="text-xs px-2.5 py-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          >
                            Ignore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer (Sticky) */}
          <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all ${
            searchOverlayOpen ? 'blur-sm brightness-75' : ''
          }`}>
            {untriagedCount > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {untriagedCount} item{untriagedCount !== 1 ? 's' : ''} remaining
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <Link
                href="/workreview"
                onClick={onClose}
                className="flex-1 px-5 py-2.5 text-sm font-medium text-center text-white rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Start review
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
