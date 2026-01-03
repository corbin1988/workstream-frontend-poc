import { Badge, Avatar } from "flowbite-react";
import { useState } from "react";

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

export default function Feed3() {
  const data = mockData;
  const [openSection, setOpenSection] = useState<{[key: string]: string | null}>({});
  
  // Helper to check if blocked
  const hasBlockers = (ticket: Ticket) => 
    ticket.linked_tickets.some(lt => lt.type === 'blocks');
  
  // Mock "needs help" from standup data
  const needsHelp = (ticket: Ticket) => {
    const standup = data.standup_entries.find(e => 
      e.linked_tickets.some(lt => lt.issue_key === ticket.issue_key)
    );
    return standup?.blockers ? standup.blockers : null;
  };

  const toggleSection = (ticketKey: string, section: string) => {
    setOpenSection(prev => ({
      ...prev,
      [ticketKey]: prev[ticketKey] === section ? null : section
    }));
  };
  
  return (
    <div className="mt-16 h-full px-4 py-6 bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-3">
        {data.tickets.map((ticket) => {
          const branch = ticket.git.branches[0];
          const blockerCount = ticket.linked_tickets.filter(lt => lt.type === 'blocks').length;
          const help = needsHelp(ticket);

          return (
            <div 
              key={ticket.issue_key}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
            >
              {/* Ultra-Compact Header */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar
                    img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                    alt={ticket.assignee}
                    rounded
                    size="xs"
                  />
                  <span className="text-sm font-medium text-white">
                    {ticket.assignee}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs font-mono text-gray-400">
                    {ticket.issue_key}
                  </span>
                  <span className="flex-1 text-sm text-white truncate" title={ticket.title}>
                    {ticket.title}
                  </span>
                  <Badge 
                    size="xs"
                    className="bg-teal-900 text-teal-300 border border-teal-700"
                  >
                    {ticket.status_category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatTime(new Date().toISOString())}
                  </span>
                </div>

                {/* Status & Risk Bar */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>{ticket.project.name}</span>
                  <span>•</span>
                  <span>{ticket.team.name}</span>
                  <span>•</span>
                  <Badge size="xs" className="bg-gray-700 text-gray-300">
                    {ticket.epic_key}
                  </Badge>
                  {help && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Needs help</span>
                      </div>
                    </>
                  )}
                  {blockerCount > 0 && (
                    <>
                      <span>•</span>
                      <Badge size="xs" className="bg-red-900 text-red-300 border border-red-700">
                        {blockerCount} blocker{blockerCount > 1 ? 's' : ''}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Code Activity Summary - One Line */}
                {branch && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-mono">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300 truncate max-w-xs" title={branch.name}>
                      {branch.name}
                    </span>
                    {branch.pr && (
                      <span className="w-2 h-2 rounded-full bg-green-400" title="PR open"></span>
                    )}
                    <span>•</span>
                    <span>{branch.diff_summary.files_changed} files</span>
                    <span className="text-green-400">+{branch.diff_summary.insertions}</span>
                    <span className="text-red-400">-{branch.diff_summary.deletions}</span>
                    <span>•</span>
                    <span>{formatDate(branch.last_commit_at)}</span>
                  </div>
                )}

                {/* Daily Review Snapshot - Compressed */}
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-gray-500">Recent:</span>
                    <span className="text-gray-300 ml-2">Updated validator usage in API endpoint</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Next:</span>
                    <span className="text-gray-300 ml-2">Finish tests and request review</span>
                  </div>
                  {/* {help && (
                    <div>
                      <span className="text-yellow-400">⚠️</span>
                      <span className="text-yellow-300 ml-2">{help}</span>
                    </div>
                  )} */}
                </div>

                {/* Dependencies - Compact Inline */}
                {/* {ticket.linked_tickets.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <span className="text-gray-500">
                      {ticket.linked_tickets.some(lt => lt.type === 'blocks') ? 'Blocks:' : 'Depends on:'}
                    </span>
                    {ticket.linked_tickets.map((linked) => (
                      <Badge 
                        key={linked.issue_key} 
                        size="xs"
                        className={
                          linked.type === 'blocks'
                            ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                            : 'bg-gray-700 text-gray-300'
                        }
                      >
                        {linked.type === 'blocks' ? '⚠️ ' : ''}{linked.issue_key}
                      </Badge>
                    ))}
                  </div>
                )} */}

                {/* Collapsed Sections */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  {/* Toggle Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Code Button */}
                    {branch && (
                      <button
                        onClick={() => toggleSection(ticket.issue_key, 'code')}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                          openSection[ticket.issue_key] === 'code'
                            ? 'text-blue-400 bg-blue-900/30'
                            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Code
                        {branch.pr && branch.pr.comments.length > 0 && (
                          <span className="text-gray-500">({branch.pr.comments.length})</span>
                        )}
                      </button>
                    )}

                    {/* Previous Updates Button */}
                    {mockPreviousUpdates.length > 0 && (
                      <button
                        onClick={() => toggleSection(ticket.issue_key, 'previous')}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                          openSection[ticket.issue_key] === 'previous'
                            ? 'text-blue-400 bg-blue-900/30'
                            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {mockPreviousUpdates.length} previous
                      </button>
                    )}

                    {/* Comments Button */}
                    <button
                      onClick={() => toggleSection(ticket.issue_key, 'comments')}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                        openSection[ticket.issue_key] === 'comments'
                          ? 'text-blue-400 bg-blue-900/30'
                          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      {ticket.comments.length} comment{ticket.comments.length > 1 ? 's' : ''}
                    </button>
                  </div>

                  {/* Content Area */}
                  {openSection[ticket.issue_key] && (
                    <div className="mt-3">
                      {/* Code Details */}
                      {openSection[ticket.issue_key] === 'code' && branch && (
                        <div className="space-y-2 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-gray-400">Branch:</span>
                              <span className="text-gray-300">{branch.name}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-gray-400">Base:</span>
                              <span className="text-gray-300">{branch.base}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-gray-400">Repo:</span>
                              <span className="text-gray-300">{branch.repo}</span>
                            </div>
                          </div>
                          
                          {branch.pr && (
                            <div className="bg-gray-900 rounded p-3 border border-gray-700">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-green-400">PR #{branch.pr.id}</span>
                                <Badge size="xs" className="bg-yellow-900 text-yellow-300 border border-yellow-700">
                                  {branch.pr.state}
                                </Badge>
                                <a href={branch.pr.url} className="text-blue-400 hover:text-blue-300 ml-auto">
                                  View →
                                </a>
                              </div>
                              
                              {branch.pr.comments.length > 0 && (
                                <div className="space-y-2 mt-3">
                                  {branch.pr.comments.map((comment) => (
                                    <div key={comment.id} className="border-t border-gray-700 pt-2 first:border-t-0 first:pt-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-300">{comment.author}</span>
                                        <Badge 
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
                                      <p className="text-gray-400">{comment.body}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Previous Updates */}
                      {openSection[ticket.issue_key] === 'previous' && (
                        <div className="space-y-2">
                          {mockPreviousUpdates.map((update, idx) => (
                            <div key={idx} className="bg-gray-900 rounded p-3 border border-gray-700 text-xs">
                              <div className="text-gray-500 mb-2 font-mono">{update.date}</div>
                              <div className="space-y-1">
                                {update.recent_changes && (
                                  <div><span className="text-gray-500">Recent:</span> <span className="text-gray-300">{update.recent_changes}</span></div>
                                )}
                                {update.next_focus && (
                                  <div><span className="text-gray-500">Next:</span> <span className="text-gray-300">{update.next_focus}</span></div>
                                )}
                                {update.context && (
                                  <div><span className="text-blue-400">Context:</span> <span className="text-gray-400 italic">{update.context}</span></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comments */}
                      {openSection[ticket.issue_key] === 'comments' && (
                        <div className="space-y-2">
                          {ticket.comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-900 rounded p-3 border border-gray-700">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-300">{comment.author}</span>
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
                                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                              </div>
                              <p className="text-xs text-gray-400">{comment.body}</p>
                            </div>
                          ))}
                          
                          {/* Add Comment Form */}
                          <div className="bg-gray-900 rounded p-3 border border-gray-700 border-dashed">
                            <textarea
                              className="w-full bg-transparent border border-gray-700 rounded text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-600 p-2"
                              placeholder="Add a comment..."
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded">Post</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
