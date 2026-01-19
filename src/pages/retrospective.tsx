import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import Drawer from '@/components/Drawer';
import WorkReviewSummary from '@/components/WorkReviewSummary';

// Type for summary list items
interface SummaryListItem {
  id: string;
  dateRange: {
    start: string;
    end: string;
  };
  scope: string;
  preview: string;
  approved: number;
  total: number;
  isFullyApproved: boolean;
}

// Mock list of summaries
const recentSummaries: SummaryListItem[] = [
  {
    id: '1',
    dateRange: {
      start: '2024-12-06',
      end: '2024-12-20',
    },
    scope: 'All Teams',
    preview: 'Authentication service v2 migration reached 65% completion with core token management...',
    approved: 3,
    total: 6,
    isFullyApproved: false,
  },
  {
    id: '2',
    dateRange: {
      start: '2024-11-22',
      end: '2024-12-05',
    },
    scope: 'All Teams',
    preview: 'Q4 sprint planning completed with resource allocation finalized...',
    approved: 4,
    total: 4,
    isFullyApproved: true,
  },
  {
    id: '3',
    dateRange: {
      start: '2024-11-08',
      end: '2024-11-21',
    },
    scope: 'API Team',
    preview: 'REST API v3 beta release with improved rate limiting and response caching...',
    approved: 2,
    total: 2,
    isFullyApproved: true,
  },
  {
    id: '4',
    dateRange: {
      start: '2024-10-25',
      end: '2024-11-07',
    },
    scope: 'Infrastructure',
    preview: 'Kubernetes cluster upgrade completed with zero downtime migration...',
    approved: 3,
    total: 3,
    isFullyApproved: true,
  },
  {
    id: '5',
    dateRange: {
      start: '2024-10-11',
      end: '2024-10-24',
    },
    scope: 'Data Team',
    preview: 'Data warehouse optimization reduced query times by 40% on average...',
    approved: 2,
    total: 2,
    isFullyApproved: true,
  },
];

// Mock data for the work review summary
const mockSummaryData = {
  dateRange: {
    start: '2024-12-06',
    end: '2024-12-20',
  },
  scope: 'All Teams',
  executiveOverview: 
    'Authentication service v2 migration reached 65% completion with core token management implemented and tested. Payment processing integration advanced through contract definition and initial implementation phases. Infrastructure capacity planning transitioned from analysis to execution with monitoring systems deployed. Two critical dependency resolutions unblocked parallel workstreams. Remaining uncertainty centers on third-party API stability and final performance validation timelines.',
  teamSummaries: [
    {
      team: 'API Team',
      completed: [
        'Token refresh mechanism',
        'JWT validation service',
        'Rate limiting implementation',
      ],
      inProgress: [
        'OAuth2 provider integration',
        'Session management refactor',
      ],
      blockers: [
        'Third-party OAuth provider rate limits affecting test coverage',
      ],
      decisions: [
        'Selected JWT over session tokens for stateless auth',
        'Committed to backward compatibility for 6 months',
      ],
      evidence: {
        prs: 12,
        tickets: 8,
        decisions: 3,
      },
    },
    {
      team: 'Infrastructure',
      completed: [
        'Monitoring dashboard deployment',
        'Log aggregation setup',
        'Database read replica configuration',
      ],
      inProgress: [
        'Auto-scaling policy tuning',
        'Backup automation implementation',
      ],
      blockers: [
        'Cloud provider quota increase pending approval',
      ],
      decisions: [
        'Adopted Prometheus over CloudWatch for cost efficiency',
        'Standardized on UTC timestamps across all services',
      ],
      evidence: {
        prs: 8,
        tickets: 5,
        decisions: 2,
      },
    },
    {
      team: 'Data Team',
      completed: [
        'ETL pipeline optimization',
        'Analytics event schema v2',
        'Data retention policy implementation',
      ],
      inProgress: [
        'Real-time processing migration',
        'Historical data backfill',
      ],
      blockers: [],
      decisions: [
        'Moved to incremental processing model',
        'Established 90-day hot storage policy',
      ],
      evidence: {
        prs: 10,
        tickets: 6,
        decisions: 2,
      },
    },
  ],
  crossTeamProgress: [
    'End-to-end authentication flow validated across API and infrastructure layers',
    'Unified logging format adopted enabling cross-service debugging',
    'Payment webhook handling architecture agreed upon between API and Data teams',
    'Database migration strategy aligned with infrastructure capacity planning',
  ],
  risks: [
    'OAuth provider rate limits may require fallback authentication mechanism',
    'Cloud quota approval timeline uncertain, could delay auto-scaling deployment by 1-2 weeks',
    'Third-party payment API stability under load remains unvalidated',
    'Historical data backfill duration not yet estimated, may impact analytics availability',
  ],
  signOffs: [
    {
      name: 'Jordan Davis',
      team: 'API Team',
      approved: false,
    },
    {
      name: 'Alex Chen',
      team: 'API Team',
      approved: true,
      timestamp: 'Dec 21 at 9:30 AM',
      comment: 'OAuth blocker is accurate. Timeline looks good.',
    },
    {
      name: 'Sam Rivera',
      team: 'Infrastructure',
      approved: true,
      timestamp: 'Dec 21 at 10:15 AM',
    },
    {
      name: 'Morgan Lee',
      team: 'Infrastructure',
      approved: false,
    },
    {
      name: 'Casey Wong',
      team: 'Data Team',
      approved: true,
      timestamp: 'Dec 21 at 11:00 AM',
      comment: 'Data retention policy correctly reflected.',
    },
    {
      name: 'Taylor Kim',
      team: 'Data Team',
      approved: false,
    },
  ],
  comments: [
    {
      id: '1',
      author: 'Alex Chen',
      team: 'API Team',
      timestamp: 'Dec 21 at 9:32 AM',
      content: 'The OAuth provider rate limit issue is being actively worked. We have a meeting scheduled with the vendor on Dec 23.',
    },
    {
      id: '2',
      author: 'Casey Wong',
      team: 'Data Team',
      timestamp: 'Dec 21 at 11:05 AM',
      content: 'Historical backfill estimate: ~3 weeks based on current processing rate. Will have exact timeline by EOW.',
    },
  ],
};

export default function RetrospectivePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handleGenerateSummary = () => {
    setDrawerOpen(false);
    // Simulate AI generation delay
    setTimeout(() => {
      setSummaryOpen(true);
    }, 300);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Retrospective Summary
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate AI-powered work review summaries from your team's work artifacts
            </p>
          </div>

          {/* Create Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Create Work Review Summary
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure date range, scope, and audience to generate a comprehensive summary
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Generate Summary
              </button>
            </div>
          </div>

          {/* Recent Summaries Section - Outside card for better scrolling */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Summaries
            </h3>
            <div className="space-y-3">
              {recentSummaries.map((summary) => (
                <button
                  key={summary.id}
                  onClick={() => setSummaryOpen(true)}
                  className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {new Date(summary.dateRange.start).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} – {new Date(summary.dateRange.end).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} • {summary.scope}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {summary.preview}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {summary.isFullyApproved ? (
                        <span className="text-xs text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded whitespace-nowrap">
                          Approved
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded whitespace-nowrap">
                          {summary.approved} of {summary.total} approved
                        </span>
                      )}
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Load More Button - Easy to add pagination */}
              <button className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Load more summaries</span>
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">AI-Generated</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically synthesizes work artifacts into executive summaries
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Team Sign-off</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Collaborative review process with multi-team approval workflow
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Shareable</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export as PDF or share read-only links with stakeholders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer for configuring summary generation */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Work Review Summary Panel */}
      <WorkReviewSummary
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        {...mockSummaryData}
      />
    </MainLayout>
  );
}
