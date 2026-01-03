import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* drawer component */}
      <form action="#" method="get" id="drawer-example"
        className={`fixed top-0 left-0 z-50 w-full h-screen max-w-lg p-6 overflow-y-auto transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} bg-white dark:bg-gray-800`}
        tabIndex={-1} aria-labelledby="drawer-label">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <h5 id="drawer-label"
              className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Generate Review Summary
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create a stakeholder-ready retrospective from work artifacts
            </p>
            <button type="button" onClick={onClose} aria-controls="drawer-example"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-5 right-5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Date Range */}
            <div>
              <h6 className="mb-3 text-sm font-medium text-gray-400 dark:text-gray-500 uppercase">
                Date Range
              </h6>
              <div className="flex gap-2 mb-4">
                <button type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                  Last week
                </button>
                <button type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                  Last 2 weeks
                </button>
                <button type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                  Last month
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block mb-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                    Start date
                  </label>
                  <input type="date" id="start-date" defaultValue="2025-12-20"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="end-date" className="block mb-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                    End date
                  </label>
                  <input type="date" id="end-date" defaultValue="2026-01-03"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Scope */}
            <div>
              <h6 className="mb-3 text-sm font-medium text-gray-400 dark:text-gray-500 uppercase">
                Scope
              </h6>
              <div className="space-y-2">
                <div className="flex items-center p-4 border border-gray-600 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input id="scope-individual" type="radio" name="scope" value="individual"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <label htmlFor="scope-individual" className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                    Individual team
                  </label>
                </div>
                <div className="flex items-center p-4 border border-gray-600 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input id="scope-multiple" type="radio" name="scope" value="multiple"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <label htmlFor="scope-multiple" className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                    Multiple teams
                  </label>
                </div>
                <div className="flex items-center p-4 border border-blue-600 rounded-lg dark:border-blue-600 bg-gray-50 dark:bg-gray-700 cursor-pointer">
                  <input id="scope-all" type="radio" name="scope" value="all" defaultChecked
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <label htmlFor="scope-all" className="ml-3 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                    All teams
                  </label>
                </div>
              </div>
            </div>

            {/* Output Audience */}
            <div>
              <h6 className="mb-3 text-sm font-medium text-gray-400 dark:text-gray-500 uppercase">
                Output Audience
              </h6>
              <div className="space-y-2">
                <div className="flex items-start p-4 border border-blue-600 rounded-lg dark:border-blue-600 bg-gray-50 dark:bg-gray-700 cursor-pointer">
                  <input id="audience-technical" type="radio" name="audience" value="technical" defaultChecked
                    className="w-4 h-4 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <div className="ml-3">
                    <label htmlFor="audience-technical" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                      Internal (technical)
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Includes technical details, ticket IDs, branch names
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 border border-gray-600 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input id="audience-stakeholder" type="radio" name="audience" value="stakeholder"
                    className="w-4 h-4 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                  <div className="ml-3">
                    <label htmlFor="audience-stakeholder" className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                      Stakeholder (non-technical)
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Focus on outcomes and business impact
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-6 border-t border-gray-700 dark:border-gray-700">
            <button type="button" onClick={onClose}
              className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-gray-700">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-5 py-2.5 text-sm font-medium text-center text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Generate summary
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
