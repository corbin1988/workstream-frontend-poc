import React from 'react';

interface RetroDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RetroDrawer({ isOpen, onClose }: RetroDrawerProps) {
  return (
    <>
      {/* Overlay backdrop with retro CRT scanline effect */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,.15) 3px)',
          }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Retro drawer component */}
      <form 
        action="#" 
        method="get" 
        id="retro-drawer"
        className={`fixed top-0 left-0 z-50 w-full h-screen max-w-lg p-6 overflow-y-auto transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 border-r-4 border-amber-600 dark:border-cyan-400 shadow-2xl`}
        style={{
          fontFamily: '"Courier New", monospace',
          boxShadow: '8px 0 20px rgba(0,0,0,0.5), inset -2px 0 8px rgba(0,0,0,0.3)',
        }}
        tabIndex={-1} 
        aria-labelledby="retro-drawer-label"
      >
        <div className="flex flex-col h-full">
          {/* Retro Header with pixelated border */}
          <div className="mb-6 pb-4 border-b-4 border-double border-amber-800 dark:border-cyan-400">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                aria-controls="retro-drawer"
                className="text-amber-900 dark:text-cyan-300 hover:bg-amber-200 dark:hover:bg-purple-800 rounded-lg text-sm p-2 inline-flex items-center border-2 border-amber-900 dark:border-cyan-400 hover:scale-110 transition-transform"
                style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <h5 
              id="retro-drawer-label"
              className="text-3xl font-bold text-amber-900 dark:text-cyan-300 mb-2 tracking-tight"
              style={{
                textShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                fontFamily: '"Courier New", monospace',
              }}
            >
              &gt; GENERATE REVIEW_
            </h5>
            <p className="text-sm text-amber-800 dark:text-cyan-200 font-mono border-l-4 border-amber-600 dark:border-cyan-400 pl-3">
              CREATE STAKEHOLDER-READY RETROSPECTIVE
            </p>
          </div>

          {/* Content with retro styling */}
          <div className="flex-1 space-y-6">
            {/* Date Range Section */}
            <div className="bg-amber-100 dark:bg-purple-950 p-4 rounded-none border-4 border-amber-700 dark:border-cyan-500" 
              style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.3)' }}>
              <h6 className="mb-3 text-xs font-bold text-amber-900 dark:text-cyan-300 uppercase tracking-widest font-mono border-b-2 border-amber-600 dark:border-cyan-400 pb-2">
                [ DATE RANGE ]
              </h6>
              <div className="flex gap-2 mb-4 flex-wrap">
                {['LAST WEEK', 'LAST 2 WEEKS', 'LAST MONTH'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="px-4 py-2 text-xs font-bold text-amber-900 dark:text-cyan-300 bg-yellow-200 dark:bg-gray-800 border-3 border-amber-900 dark:border-cyan-400 rounded-none hover:bg-amber-300 dark:hover:bg-purple-800 transition-all hover:-translate-y-1 font-mono"
                    style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.4)' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block mb-2 text-xs font-bold text-amber-900 dark:text-cyan-300 uppercase font-mono">
                    START_DATE:
                  </label>
                  <input 
                    type="date" 
                    id="start-date" 
                    defaultValue="2025-12-20"
                    className="bg-yellow-100 dark:bg-gray-800 border-3 border-amber-900 dark:border-cyan-400 text-amber-900 dark:text-cyan-300 text-sm rounded-none focus:ring-4 focus:ring-amber-500 dark:focus:ring-cyan-500 focus:border-amber-900 dark:focus:border-cyan-300 block w-full p-2.5 font-mono"
                    style={{ boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.3)' }}
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block mb-2 text-xs font-bold text-amber-900 dark:text-cyan-300 uppercase font-mono">
                    END_DATE:
                  </label>
                  <input 
                    type="date" 
                    id="end-date" 
                    defaultValue="2026-01-03"
                    className="bg-yellow-100 dark:bg-gray-800 border-3 border-amber-900 dark:border-cyan-400 text-amber-900 dark:text-cyan-300 text-sm rounded-none focus:ring-4 focus:ring-amber-500 dark:focus:ring-cyan-500 focus:border-amber-900 dark:focus:border-cyan-300 block w-full p-2.5 font-mono"
                    style={{ boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.3)' }}
                  />
                </div>
              </div>
            </div>

            {/* Scope Section */}
            <div className="bg-amber-100 dark:bg-purple-950 p-4 rounded-none border-4 border-amber-700 dark:border-cyan-500"
              style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.3)' }}>
              <h6 className="mb-3 text-xs font-bold text-amber-900 dark:text-cyan-300 uppercase tracking-widest font-mono border-b-2 border-amber-600 dark:border-cyan-400 pb-2">
                [ SCOPE ]
              </h6>
              <div className="space-y-3">
                {[
                  { id: 'scope-individual', value: 'individual', label: 'INDIVIDUAL TEAM' },
                  { id: 'scope-multiple', value: 'multiple', label: 'MULTIPLE TEAMS' },
                  { id: 'scope-all', value: 'all', label: 'ALL TEAMS', checked: true },
                ].map((option) => (
                  <div 
                    key={option.id}
                    className={`flex items-center p-3 border-3 ${
                      option.checked 
                        ? 'border-amber-900 dark:border-cyan-400 bg-yellow-200 dark:bg-purple-800' 
                        : 'border-amber-700 dark:border-cyan-600 bg-yellow-100 dark:bg-gray-800'
                    } rounded-none hover:bg-amber-200 dark:hover:bg-purple-700 cursor-pointer transition-all hover:-translate-x-1`}
                    style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
                  >
                    <input 
                      id={option.id}
                      type="radio" 
                      name="scope" 
                      value={option.value}
                      defaultChecked={option.checked}
                      className="w-5 h-5 text-amber-900 dark:text-cyan-400 bg-yellow-100 dark:bg-gray-700 border-amber-900 dark:border-cyan-400 focus:ring-amber-500 dark:focus:ring-cyan-500 focus:ring-4"
                    />
                    <label htmlFor={option.id} className="ml-3 text-sm font-bold text-amber-900 dark:text-cyan-300 cursor-pointer uppercase font-mono">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Audience Section */}
            <div className="bg-amber-100 dark:bg-purple-950 p-4 rounded-none border-4 border-amber-700 dark:border-cyan-500"
              style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.3)' }}>
              <h6 className="mb-3 text-xs font-bold text-amber-900 dark:text-cyan-300 uppercase tracking-widest font-mono border-b-2 border-amber-600 dark:border-cyan-400 pb-2">
                [ OUTPUT AUDIENCE ]
              </h6>
              <div className="space-y-3">
                {[
                  { 
                    id: 'audience-technical', 
                    value: 'technical', 
                    label: 'INTERNAL (TECHNICAL)', 
                    desc: 'INCLUDES TECHNICAL DETAILS, TICKET IDS, BRANCH NAMES',
                    checked: true 
                  },
                  { 
                    id: 'audience-stakeholder', 
                    value: 'stakeholder', 
                    label: 'STAKEHOLDER (NON-TECH)', 
                    desc: 'FOCUS ON OUTCOMES AND BUSINESS IMPACT',
                    checked: false 
                  },
                ].map((option) => (
                  <div 
                    key={option.id}
                    className={`flex items-start p-3 border-3 ${
                      option.checked 
                        ? 'border-amber-900 dark:border-cyan-400 bg-yellow-200 dark:bg-purple-800' 
                        : 'border-amber-700 dark:border-cyan-600 bg-yellow-100 dark:bg-gray-800'
                    } rounded-none hover:bg-amber-200 dark:hover:bg-purple-700 cursor-pointer transition-all hover:-translate-x-1`}
                    style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
                  >
                    <input 
                      id={option.id}
                      type="radio" 
                      name="audience" 
                      value={option.value}
                      defaultChecked={option.checked}
                      className="w-5 h-5 mt-0.5 text-amber-900 dark:text-cyan-400 bg-yellow-100 dark:bg-gray-700 border-amber-900 dark:border-cyan-400 focus:ring-amber-500 dark:focus:ring-cyan-500 focus:ring-4"
                    />
                    <div className="ml-3">
                      <label htmlFor={option.id} className="text-sm font-bold text-amber-900 dark:text-cyan-300 cursor-pointer uppercase font-mono block mb-1">
                        {option.label}
                      </label>
                      <p className="text-xs text-amber-700 dark:text-cyan-400 font-mono">
                        &gt; {option.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Retro Footer with chunky buttons */}
          <div className="flex gap-3 pt-6 mt-6 border-t-4 border-double border-amber-800 dark:border-cyan-400">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-5 py-3 text-sm font-bold text-amber-900 dark:text-cyan-300 bg-yellow-200 dark:bg-gray-800 border-4 border-amber-900 dark:border-cyan-400 rounded-none hover:bg-amber-300 dark:hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-amber-500 dark:focus:ring-cyan-500 transition-all hover:-translate-y-1 uppercase font-mono"
              style={{ boxShadow: '5px 5px 0 rgba(0,0,0,0.4)' }}
            >
              [X] CANCEL
            </button>
            <button 
              type="submit"
              className="flex-1 px-5 py-3 text-sm font-bold text-yellow-100 dark:text-gray-900 bg-amber-700 dark:bg-cyan-400 border-4 border-amber-900 dark:border-cyan-600 rounded-none hover:bg-amber-800 dark:hover:bg-cyan-300 focus:ring-4 focus:outline-none focus:ring-amber-500 dark:focus:ring-cyan-500 transition-all hover:-translate-y-1 uppercase font-mono animate-pulse"
              style={{ boxShadow: '5px 5px 0 rgba(0,0,0,0.4)' }}
            >
              [&gt;] GENERATE NOW
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
