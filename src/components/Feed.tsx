import { Badge, Avatar } from "flowbite-react";

// Types based on your data structure
interface Project {
  key: string;
  name: string;
}

interface Team {
  key: string;
  name: string;
}

interface Comment {
  id: string;
  author: string;
  created_at: string;
  body: string;
  type: "context" | "decision" | "review" | "resolution";
}

interface PRComment {
  id: string;
  author: string;
  created_at: string;
  body: string;
  type: "review" | "resolution";
}

interface PullRequest {
  id: number;
  state: string;
  url: string;
  comments: PRComment[];
}

interface DiffSummary {
  files_changed: number;
  insertions: number;
  deletions: number;
}

interface Branch {
  name: string;
  repo: string;
  base: string;
  last_commit_at: string;
  diff_summary: DiffSummary;
  pr?: PullRequest;
}

interface Git {
  branches: Branch[];
  linked_pr_ids: number[];
}

interface LinkedTicket {
  issue_key: string;
  type: "parent" | "blocks";
}

interface Ticket {
  project: Project;
  team: Team;
  issue_key: string;
  epic_key: string;
  title: string;
  description: string;
  intent_frozen_at: string;
  assignee: string;
  status_category: string;
  priority: string;
  due_date: string;
  comments: Comment[];
  git: Git;
  linked_tickets: LinkedTicket[];
}

interface StandupEntry {
  id: string;
  date: string;
  user: string;
  yesterday: string;
  today: string;
  blockers: string;
  team_comment: string;
  linked_tickets: { issue_key: string }[];
}

interface WorkReviewData {
  tickets: Ticket[];
  standup_entries: StandupEntry[];
  teams: any[];
  people: any[];
}

// Mock data based on your structure
const mockData: WorkReviewData = {
  "tickets": [
    {
      "project": {
        "key": "PLATFORM",
        "name": "Platform Services"
      },
      "team": {
        "key": "API",
        "name": "API Team"
      },
      "issue_key": "ABC-123",
      "epic_key": "EPIC-42",
      "title": "Add authentication endpoint for mobile clients",
      "description": "Original problem statement or requirement",
      "intent_frozen_at": "2025-01-15T14:32:00Z",
      "assignee": "Kate Martinez",
      "status_category": "In Progress",
      "priority": "High",
      "due_date": "2025-01-30",
      "comments": [
        {
          "id": "cmt-001",
          "author": "Kate Martinez",
          "created_at": "2025-01-16T10:12:00Z",
          "body": "Clarified edge case for unauthenticated users.",
          "type": "context"
        },
        {
          "id": "cmt-002",
          "author": "Kate Martinez",
          "created_at": "2025-01-17T14:45:00Z",
          "body": "Decision: reuse existing token refresh logic.",
          "type": "decision"
        }
      ],
      "git": {
        "branches": [
          {
            "name": "feature/ABC-123-add-endpoint",
            "repo": "api-service",
            "base": "main",
            "last_commit_at": "2025-01-18T21:04:11Z",
            "diff_summary": {
              "files_changed": 12,
              "insertions": 340,
              "deletions": 97
            },
            "pr": {
              "id": 456,
              "state": "open",
              "url": "https://github.com/org/api-service/pull/456",
              "comments": [
                {
                  "id": "prc-101",
                  "author": "Brandon",
                  "created_at": "2025-01-18T09:30:00Z",
                  "body": "Can we reuse the existing validator here?",
                  "type": "review"
                },
                {
                  "id": "prc-102",
                  "author": "Kate Martinez",
                  "created_at": "2025-01-18T11:02:00Z",
                  "body": "Updated to reuse shared validator.",
                  "type": "resolution"
                }
              ]
            }
          }
        ],
        "linked_pr_ids": [456]
      },
      "linked_tickets": [
        {
          "issue_key": "ABC-100",
          "type": "parent"
        },
        {
          "issue_key": "ABC-140",
          "type": "blocks"
        }
      ]
    }
  ],
  "standup_entries": [
    {
      "id": "su-2025-01-18-kate",
      "date": "2025-12-30",
      "user": "Kate Martinez",
      "yesterday": "Went over some new wireframes with Brandon\nHad a sync up meeting with Daniel for the new marketing campaigns",
      "today": "Check current product metrics and re-create all dashboards\nBrainstorming meeting on how to boost internal user growth",
      "blockers": "When you can @brandon let's talk about the status of the new landing pages",
      "team_comment": "",
      "linked_tickets": [
        {
          "issue_key": "ABC-123"
        },
        {
          "issue_key": "ABC-140"
        }
      ]
    },
    {
      "id": "su-2025-01-19-kate",
      "date": "2025-01-19",
      "user": "Kate Martinez",
      "yesterday": "Reviewed PRs and fixed CI failure",
      "today": "Finish endpoint tests and request review",
      "blockers": "Waiting on QA environment to stop failing deployments",
      "team_comment": "If env is still flaky by noon, I'll switch to local contract tests",
      "linked_tickets": [
        {
          "issue_key": "ABC-123"
        },
        {
          "issue_key": "ABC-124"
        }
      ]
    }
  ],
  "teams": [],
  "people": []
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function Feed() {
  const data = mockData;
  
  return (
    <div className="mt-16 h-full px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {data.standup_entries.map((entry) => {
          // Find related ticket for context
          const relatedTicket = data.tickets.find(t => 
            entry.linked_tickets.some(lt => lt.issue_key === t.issue_key)
          );

          return (
            <div 
              key={entry.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Avatar
                    img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                    alt={entry.user}
                    rounded
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {entry.user}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        posted an update for Daily
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(new Date().toISOString())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-6">
                {/* How do you feel today */}
                <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    How do you feel today?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    I am doing great! 💪
                  </p>
                </div>

                {/* What did you do since yesterday */}
                <div className="border-l-4 border-cyan-400 dark:border-cyan-500 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    What did you do since yesterday?
                  </h3>
                  <div className="space-y-2">
                    {entry.yesterday.split('\n').map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-gray-700 dark:text-gray-300">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What will you do today */}
                <div className="border-l-4 border-blue-500 dark:border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    What will you do today?
                  </h3>
                  <div className="space-y-2">
                    {entry.today.split('\n').map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-gray-700 dark:text-gray-300">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blockers */}
                {entry.blockers && (
                  <div className="border-l-4 border-red-400 dark:border-red-500 pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Anything blocking your progress?
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {entry.blockers.split('@').map((part, idx) => {
                        if (idx === 0) return part;
                        const mention = part.split(' ')[0];
                        const rest = part.slice(mention.length);
                        return (
                          <span key={idx}>
                            <span className="text-blue-600 dark:text-blue-400">@{mention}</span>
                            {rest}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                )}

                {/* Related Ticket Context (if available) */}
                {relatedTicket && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge color="indigo" size="sm">{relatedTicket.issue_key}</Badge>
                          <Badge color="gray" size="sm">{relatedTicket.epic_key}</Badge>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {relatedTicket.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {relatedTicket.project.name} • {relatedTicket.team.name}
                        </p>
                      </div>
                      <Badge color={relatedTicket.status_category === 'In Progress' ? 'info' : 'success'}>
                        {relatedTicket.status_category}
                      </Badge>
                    </div>

                    {/* Git Activity */}
                    {relatedTicket.git.branches.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Code Activity
                        </h5>
                        {relatedTicket.git.branches.map((branch) => (
                          <div key={branch.name} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="font-mono text-gray-700 dark:text-gray-300">{branch.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                              <span>{branch.diff_summary.files_changed} files</span>
                              <span className="text-green-600 dark:text-green-400">+{branch.diff_summary.insertions}</span>
                              <span className="text-red-600 dark:text-red-400">-{branch.diff_summary.deletions}</span>
                              <span>Updated {formatDate(branch.last_commit_at)}</span>
                            </div>

                            {/* PR Info */}
                            {branch.pr && (
                              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    Pull Request #{branch.pr.id}
                                  </span>
                                  <Badge color="warning" size="xs">{branch.pr.state}</Badge>
                                </div>
                                
                                {/* PR Comments */}
                                {branch.pr.comments.length > 0 && (
                                  <div className="space-y-2 mt-3">
                                    {branch.pr.comments.map((comment) => (
                                      <div key={comment.id} className="text-xs">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {comment.author}
                                          </span>
                                          <Badge color={comment.type === 'review' ? 'purple' : 'green'} size="xs">
                                            {comment.type}
                                          </Badge>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                                          {comment.body}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dependencies */}
                    {relatedTicket.linked_tickets.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dependencies:
                        </span>
                        {relatedTicket.linked_tickets.map((linked) => (
                          <Badge 
                            key={linked.issue_key} 
                            color={linked.type === 'blocks' ? 'warning' : 'gray'}
                            size="sm"
                          >
                            {linked.type === 'blocks' ? '🚫' : '👆'} {linked.issue_key}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
