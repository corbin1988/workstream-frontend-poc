import { Badge, Avatar } from "flowbite-react";
import { useState } from "react";
import mockWorkData from "@/data/mockWorkData.json";

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

// Mock previous updates data
const mockPreviousUpdates: DailyUpdate[] = [
  {
    date: "2025-12-31",
    user: "jdavis",
    recent_changes: "Fixed CI failure in integration tests",
    next_focus: "Refactor endpoint handler logic",
    context: "Test suite now green but slow - may optimize later",
    linked_tickets: ["ABC-123"]
  },
  {
    date: "2025-12-30",
    user: "jdavis",
    recent_changes: "Started implementation of new endpoint",
    next_focus: "Write integration tests",
    linked_tickets: ["ABC-123"]
  },
  {
    date: "2025-12-27",
    user: "jdavis",
    recent_changes: "Reviewed design docs and API specifications",
    next_focus: "Begin implementation",
    context: "Aligned with team on approach",
    linked_tickets: ["ABC-123"]
  },
  {
    date: "2025-12-20",
    user: "jdavis",
    recent_changes: "Initial planning and research",
    next_focus: "Create technical design document",
    linked_tickets: ["ABC-123"]
  }
];


function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time parts for accurate date comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  const diffTime = todayOnly.getTime() - dateOnly.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays <= 6) {
    // Show day of week for last 7 days
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    // Show full date for older entries
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

interface Feed5Props {
  selectedTeam?: string | null;
}

export default function Feed5({ selectedTeam }: Feed5Props) {
  const data = mockWorkData as WorkReviewData;
  // Filter tickets by selected team when provided
  const tickets = selectedTeam
    ? data.tickets.filter(t => t.team?.key === selectedTeam || t.team?.name === selectedTeam)
    : data.tickets;
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
    <div className="w-full space-y-4 sm:space-y-6">

        {/* Ticket Cards */}
  {tickets.map((ticket) => {
          const branch = ticket.git.branches[0];
          
          return (
            <div 
              key={ticket.issue_key}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              {/* Header: Avatar, Name, Time */}
              <div className="flex items-start gap-3">
                <Avatar
                  alt={ticket.assignee}
                  img=""
                  placeholderInitials={getInitials(ticket.assignee)}
                  rounded
                  size="md"
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{ticket.assignee}</span>
                    <span className="text-gray-500 dark:text-gray-500">·</span>
                    <span className="text-gray-500 dark:text-gray-500 text-sm">{formatTime(ticket.intent_frozen_at)}</span>
                  </div>
                  
                  {/* Ticket Key and Status */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{ticket.issue_key}</span>
                    <Badge 
                      size="xs"
                      className={
                        ticket.status_category === 'In Progress'
                          ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                          : ticket.status_category === 'Done'
                          ? 'bg-green-900 text-green-300 border border-green-700'
                          : 'bg-gray-700 text-gray-300 border border-gray-600'
                      }
                    >
                      {ticket.status_category}
                    </Badge>
                  </div>
                </div>

                {/* More options button (top right) */}
                <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>

              {/* Content: Title and Description */}
              <div className="mt-3 ml-0 sm:ml-[52px] min-w-0">
                {/* Code Information */}
                {ticket.git.branches.length > 0 && (
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs overflow-hidden">
                    {/* Branch Info */}
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 min-w-0">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-mono truncate">{ticket.git.branches[0].name}</span>
                    </div>

                    {/* File Stats */}
                    {ticket.git.branches[0].diff_summary && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">{ticket.git.branches[0].diff_summary.files_changed} files</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">+{ticket.git.branches[0].diff_summary.insertions}</span>
                          <span className="text-red-600 dark:text-red-400 font-medium">-{ticket.git.branches[0].diff_summary.deletions}</span>
                        </div>
                      </>
                    )}

                    {/* PR Info */}
                    {ticket.git.branches[0].pr && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-400">PR #{ticket.git.branches[0].pr.id}</span>
                          <Badge 
                            size="xs"
                            className={
                              ticket.git.branches[0].pr.state === 'open'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            }
                          >
                            {ticket.git.branches[0].pr.state}
                          </Badge>
                        </div>
                      </>
                    )}

                    {/* Last Update Time */}
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-gray-500 dark:text-gray-500">
                      Updated {formatRelativeDate(ticket.git.branches[0].last_commit_at)}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {ticket.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {ticket.description}
                </p>

                {/* Last Update Section */}
                {data.standup_entries.filter(e => 
                  e.linked_tickets.some(lt => lt.issue_key === ticket.issue_key)
                ).length > 0 && (
                  <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-gray-900/50 rounded-r p-3">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      What did you do since yesterday?
                    </h4>
                    {data.standup_entries
                      .filter(e => e.linked_tickets.some(lt => lt.issue_key === ticket.issue_key))
                      .slice(0, 1)
                      .map(entry => (
                        <ul key={entry.id} className="space-y-1">
                          {entry.yesterday.split('\n').map((item, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                              <span className="mr-2">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ))
                    }
                  </div>
                )}

                {/* Collapsed Sections */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {/* Toggle Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Code Button */}
                    {branch && (
                      <button
                        onClick={() => toggleSection(ticket.issue_key, 'code')}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                          openSection[ticket.issue_key] === 'code'
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Code
                        {branch.pr && branch.pr.comments.length > 0 && (
                          <span className="text-gray-400 dark:text-gray-500">({branch.pr.comments.length})</span>
                        )}
                      </button>
                    )}

                    {/* Previous Updates Button */}
                    {mockPreviousUpdates.length > 0 && (
                      <button
                        onClick={() => toggleSection(ticket.issue_key, 'previous')}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                          openSection[ticket.issue_key] === 'previous'
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
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
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
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
                      {openSection[ticket.issue_key] === 'code' && ticket.git.branches.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Code Activity
                          </h5>
                          {ticket.git.branches.map((branch) => (
                            <div key={branch.name} className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
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

                      {/* Previous Updates */}
                      {openSection[ticket.issue_key] === 'previous' && (
                        <div className="space-y-6">
                          {mockPreviousUpdates.map((update, idx) => {
                            const colors = [
                              { border: 'border-cyan-400 dark:border-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                              { border: 'border-blue-500 dark:border-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                              { border: 'border-purple-400 dark:border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                              { border: 'border-pink-400 dark:border-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' }
                            ];
                            const color = colors[idx % colors.length];
                            
                            return (
                              <div key={idx} className={`border-l-4 ${color.border} ${color.bg} rounded-r pl-4 p-3 space-y-4`}>
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                  {formatRelativeDate(update.date)} Update
                                </h4>
                                {update.recent_changes && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                      Recent Changes
                                    </h5>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                      {update.recent_changes}
                                    </p>
                                  </div>
                                )}
                                {update.next_focus && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                      Next Focus
                                    </h5>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                      {update.next_focus}
                                    </p>
                                  </div>
                                )}
                                {update.context && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                      Context
                                    </h5>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                                      {update.context}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Comments */}
                      {openSection[ticket.issue_key] === 'comments' && (
                        <div className="antialiased">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">
                              Discussion ({ticket.comments.length})
                            </h2>
                          </div>
                          
                          {/* Comment Form */}
                          <form className="mb-6">
                            <div className="py-2 px-4 mb-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                              <label htmlFor="comment" className="sr-only">Your comment</label>
                              <textarea
                                id="comment"
                                rows={4}
                                className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
                                placeholder="Write a comment..."
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              className="inline-flex items-center py-2 px-4 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
                            >
                              Post comment
                            </button>
                          </form>

                          {/* Comments List */}
                          {ticket.comments.map((comment, idx) => (
                            <article key={comment.id} className={`p-4 mb-3 text-sm bg-white dark:bg-gray-800 ${idx > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                              <footer className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <p className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white font-semibold">
                                    <Avatar
                                      alt={comment.author}
                                      img=""
                                      placeholderInitials={getInitials(comment.author)}
                                      rounded
                                      size="xs"
                                      className="mr-2"
                                    />
                                    {comment.author}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    <time dateTime={comment.created_at} title={formatDate(comment.created_at)}>
                                      {formatDate(comment.created_at)}
                                    </time>
                                  </p>
                                  <Badge 
                                    size="xs"
                                    className={`ml-2 ${
                                      comment.type === 'decision'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                        : comment.type === 'context'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {comment.type}
                                  </Badge>
                                </div>
                                <button
                                  type="button"
                                  className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 dark:text-gray-400 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                                >
                                  <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                                    <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
                                  </svg>
                                  <span className="sr-only">Comment settings</span>
                                </button>
                              </footer>
                              <p className="text-gray-500 dark:text-gray-400">{comment.body}</p>
                              <div className="flex items-center mt-4 space-x-4">
                                <button
                                  type="button"
                                  className="flex items-center text-sm text-gray-500 hover:underline dark:text-gray-400 font-medium"
                                >
                                  <svg className="mr-1.5 w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 18">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"/>
                                  </svg>
                                  Reply
                                </button>
                              </div>
                            </article>
                          ))}
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
  );
}
