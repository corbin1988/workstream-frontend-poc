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

interface DailyUpdate {
  date: string;
  user: string;
  recent_changes?: string;
  next_focus?: string;
  needs_help?: string;
  context?: string;
  linked_tickets: string[];
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

// Mock previous updates data
const mockPreviousUpdates: DailyUpdate[] = [
  {
    date: "2025-01-18",
    user: "jdavis",
    recent_changes: "Fixed CI failure in integration tests",
    next_focus: "Refactor endpoint handler logic",
    context: "Test suite now green but slow - may optimize later",
    linked_tickets: ["ABC-123"]
  },
  {
    date: "2025-01-17",
    user: "jdavis",
    recent_changes: "Started implementation of new endpoint",
    next_focus: "Write integration tests",
    linked_tickets: ["ABC-123"]
  }
];


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

export default function Feed2() {
  const data = mockData;
  
  return (
    <div className="mt-16 h-full px-4 py-6 bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {data.tickets.map((ticket) => {
          // Find related standup entry
          const relatedStandup = data.standup_entries.find(entry => 
            entry.linked_tickets.some(lt => lt.issue_key === ticket.issue_key)
          );

          return (
            <div 
              key={ticket.issue_key}
              className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
            >
              {/* Header with user info */}
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <Avatar
                    img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                    alt={ticket.assignee}
                    rounded
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {ticket.assignee}
                      </span>
                      <span className="text-sm text-gray-400">
                        updated
                      </span>
                      <span className="font-medium text-gray-300">
                        {ticket.issue_key}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(new Date().toISOString())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Review Card Section */}
              <div className="px-6 py-6">
                {/* Ticket Identity */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge color="gray" className="bg-gray-700 text-white">
                        {ticket.issue_key}
                      </Badge>
                      <Badge color="gray" className="bg-gray-700 text-white">
                        {ticket.epic_key}
                      </Badge>
                      <Badge 
                        color="info" 
                        className="bg-teal-900 text-teal-300 border border-teal-700"
                      >
                        {ticket.status_category}
                      </Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {ticket.title}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {ticket.project.name} • {ticket.team.name}
                    </p>
                  </div>
                </div>

                {/* Branch and PR Info - Compact */}
                {ticket.git.branches.length > 0 && (
                  <div className="mb-4">
                    {ticket.git.branches.map((branch) => (
                      <div key={branch.name} className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="font-mono text-gray-300">{branch.name}</span>
                        </div>
                        {branch.pr && (
                          <>
                            <span className="text-green-400">PR #{branch.pr.id}</span>
                            <span>•</span>
                            <span className="text-emerald-400">Open</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Code Activity Section */}
                {ticket.git.branches.length > 0 && (
                  <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-300 mb-3">
                      Code Activity
                    </h5>
                    {ticket.git.branches.map((branch) => (
                      <div key={branch.name} className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="font-mono text-gray-300">{branch.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{branch.diff_summary.files_changed} files</span>
                          <span className="text-green-400">+{branch.diff_summary.insertions}</span>
                          <span className="text-red-400">-{branch.diff_summary.deletions}</span>
                          <span>Updated {formatDate(branch.last_commit_at)}</span>
                        </div>

                        {/* Pull Request */}
                        {branch.pr && (
                          <div className="mt-3 p-4 bg-gray-800 rounded border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-white">
                                  Pull Request #{branch.pr.id}
                                </span>
                                <Badge 
                                  color="warning" 
                                  size="xs"
                                  className="bg-yellow-900 text-yellow-300 border border-yellow-700"
                                >
                                  {branch.pr.state}
                                </Badge>
                              </div>
                              
                              {/* Comment Count */}
                              {branch.pr.comments.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                  </svg>
                                  <span>{branch.pr.comments.length}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* PR Comments - Collapsible */}
                            {branch.pr.comments.length > 0 && (
                              <details className="mt-3">
                                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  View conversation
                                </summary>
                                <div className="mt-3 space-y-3">
                                  {branch.pr.comments.map((comment) => (
                                    <div key={comment.id} className="text-sm">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-300">
                                          {comment.author}
                                        </span>
                                        <Badge 
                                          color={comment.type === 'review' ? 'purple' : 'success'} 
                                          size="xs"
                                          className={
                                            comment.type === 'review' 
                                              ? 'bg-purple-900 text-purple-300 border border-purple-700'
                                              : 'bg-green-900 text-green-300 border border-green-700'
                                          }
                                        >
                                          {comment.type}
                                        </Badge>
                                      </div>
                                      <p className="text-gray-400 text-xs">
                                        {comment.body}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Daily Review Update - Display Card */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg mb-4 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-white">Still working on this</span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Recent changes: </span>
                      <span className="text-white">Updated validator usage in API endpoint</span>
                    </div>

                    <div>
                      <span className="text-gray-400">Next focus: </span>
                      <span className="text-white">Finish tests and request review</span>
                    </div>

                    <div>
                      <span className="text-yellow-500 font-medium">Needs help: </span>
                      <span className="text-white">Waiting on QA env stability</span>
                    </div>

                    <div>
                      <span className="text-blue-400">Context: </span>
                      <span className="text-gray-300 italic">If env stays flaky, switching to local contract tests</span>
                    </div>
                  </div>
                </div>

                {/* Previous Updates - Collapsible */}
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2 py-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Previous updates ({mockPreviousUpdates.length})
                  </summary>
                  
                  <div className="mt-3 space-y-3">
                    {mockPreviousUpdates.map((update, idx) => (
                      <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                          <span className="font-mono">{update.date}</span>
                          <span>•</span>
                          <span>@{update.user}</span>
                          <span>•</span>
                          {update.linked_tickets.map((ticket, i) => (
                            <Badge key={i} color="gray" size="xs" className="bg-gray-700 text-gray-300">
                              {ticket}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {update.recent_changes && (
                            <div>
                              <span className="text-gray-400">Recent changes: </span>
                              <span className="text-white">{update.recent_changes}</span>
                            </div>
                          )}

                          {update.next_focus && (
                            <div>
                              <span className="text-gray-400">Next focus: </span>
                              <span className="text-white">{update.next_focus}</span>
                            </div>
                          )}

                          {update.needs_help && (
                            <div>
                              <span className="text-yellow-500 font-medium">Needs help: </span>
                              <span className="text-white">{update.needs_help}</span>
                            </div>
                          )}

                          {update.context && (
                            <div>
                              <span className="text-blue-400">Context: </span>
                              <span className="text-gray-300 italic">{update.context}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                {/* Dependencies */}
                {ticket.linked_tickets.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-300">
                        Dependencies:
                      </span>
                      {ticket.linked_tickets.map((linked) => (
                        <Badge 
                          key={linked.issue_key} 
                          color={linked.type === 'blocks' ? 'warning' : 'gray'}
                          size="sm"
                          className={
                            linked.type === 'blocks'
                              ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                              : 'bg-gray-700 text-gray-300'
                          }
                        >
                          {linked.type === 'blocks' ? '⚠️' : '👆'} {linked.issue_key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ticket Comments Section */}
                {ticket.comments.length > 0 && (
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <details>
                      <summary className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white mb-3">
                        <span>Comments</span>
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-normal">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <span>{ticket.comments.length}</span>
                        </div>
                      </summary>
                      <div className="space-y-3 mt-3">
                        {ticket.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar
                              img={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=random`}
                              alt={comment.author}
                              rounded
                              size="xs"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-300">
                                  {comment.author}
                                </span>
                                <Badge 
                                  size="xs"
                                  className={
                                    comment.type === 'decision'
                                      ? 'bg-purple-900 text-purple-300 border border-purple-700'
                                      : 'bg-blue-900 text-blue-300 border border-blue-700'
                                  }
                                >
                                  {comment.type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                {comment.body}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <details>
                    <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add a comment
                    </summary>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mt-3">
                      <div className="flex gap-3 items-start">
                        <Avatar
                          img="https://ui-avatars.com/api/?name=You&background=4ade80"
                          alt="You"
                          rounded
                          size="xs"
                        />
                        <div className="flex-1">
                          <textarea
                            className="w-full bg-transparent border-none text-sm text-gray-300 placeholder-gray-500 focus:outline-none resize-none"
                            placeholder="Add a comment..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-gray-700">
                        <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-300 transition-colors">
                          Cancel
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                          Comment
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
