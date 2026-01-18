import React, { useState } from 'react';
import { Avatar, Badge } from 'flowbite-react';
import mockActivityData from '@/data/mockActivityData.json';

// Types based on webhook event structure
interface Commit {
  sha: string;
  message: string;
  files_changed: number;
  insertions: number;
  deletions: number;
}

interface PullRequest {
  number: number;
  title: string;
  state: 'open' | 'merged' | 'closed';
  url: string;
  base: string;
  head: string;
}

interface Review {
  state: 'approved' | 'changes_requested' | 'commented';
  body: string;
}

interface Comment {
  body: string;
  url: string;
}

interface ActivityEvent {
  id: string;
  type: 'push' | 'pr_opened' | 'pr_merged' | 'pr_review' | 'pr_comment' | 'branch_created' | 'branch_deleted';
  timestamp: string;
  author: string;
  repo: string;
  team: string;
  branch?: string;
  commits?: Commit[];
  pr?: PullRequest;
  review?: Review;
  comment?: Comment;
}

interface ActivityFeedData {
  activities: ActivityEvent[];
  teams: any[];
}

interface ActivityFeedProps {
  selectedTeam?: string | null;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getEventIcon(type: string) {
  switch (type) {
    case 'push':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      );
    case 'pr_opened':
    case 'pr_merged':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
        </svg>
      );
    case 'pr_review':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      );
    case 'pr_comment':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      );
    case 'branch_created':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      );
    case 'branch_deleted':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
}

function getEventDescription(event: ActivityEvent): string {
  switch (event.type) {
    case 'push':
      const commitCount = event.commits?.length || 0;
      return `pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${event.branch}`;
    case 'pr_opened':
      return `opened PR #${event.pr?.number}`;
    case 'pr_merged':
      return `merged PR #${event.pr?.number}`;
    case 'pr_review':
      const reviewState = event.review?.state === 'approved' ? 'approved' : 
                         event.review?.state === 'changes_requested' ? 'requested changes on' : 
                         'reviewed';
      return `${reviewState} PR #${event.pr?.number}`;
    case 'pr_comment':
      return `commented on PR #${event.pr?.number}`;
    case 'branch_created':
      return `created branch ${event.branch}`;
    case 'branch_deleted':
      return `deleted branch ${event.branch}`;
    default:
      return 'performed an action';
  }
}

export default function ActivityFeed({ selectedTeam }: ActivityFeedProps) {
  const data = mockActivityData as ActivityFeedData;
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Filter activities by selected team
  const activities = selectedTeam
    ? data.activities.filter(a => a.team === selectedTeam)
    : data.activities;

  const toggleExpanded = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {activities.map((event) => {
        const isExpanded = expandedEvents.has(event.id);
        const hasExpandableContent = (event.commits && event.commits.length > 0) || 
                                     (event.comment && event.comment.body.length > 150) ||
                                     (event.review && event.review.body.length > 150);

        return (
          <div 
            key={event.id}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            {/* Header: Avatar, Name, Action, Time */}
            <div className="flex items-start gap-3">
              <Avatar
                alt={event.author}
                img=""
                placeholderInitials={getInitials(event.author)}
                rounded
                size="md"
                className="flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{event.author}</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{getEventDescription(event)}</span>
                  <span className="text-gray-500 dark:text-gray-500">·</span>
                  <span className="text-gray-500 dark:text-gray-500 text-sm">{formatRelativeDate(event.timestamp)}</span>
                </div>
                
                {/* Repository and Team info */}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{event.repo}</span>
                  <Badge 
                    size="xs"
                    className="bg-gray-700 text-gray-300 border border-gray-600"
                  >
                    {event.team}
                  </Badge>
                </div>
              </div>

              {/* Event icon */}
              <div className={`flex-shrink-0 p-2 rounded-full ${
                event.type === 'pr_merged' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                event.type === 'pr_review' && event.review?.state === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                event.type === 'pr_review' && event.review?.state === 'changes_requested' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                event.type === 'push' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {getEventIcon(event.type)}
              </div>
            </div>

            {/* Content: PR Title, Commits, Comments, Reviews */}
            <div className="mt-3 ml-0 sm:ml-[52px] min-w-0">
              {/* PR Title */}
              {event.pr && (
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {event.pr.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-mono">#{event.pr.number}</span>
                    <span>•</span>
                    <span>{event.pr.head} → {event.pr.base}</span>
                    {event.pr.state === 'merged' && (
                      <>
                        <span>•</span>
                        <Badge size="xs" className="bg-purple-900 text-purple-300 border border-purple-700">
                          Merged
                        </Badge>
                      </>
                    )}
                    {event.pr.state === 'open' && (
                      <>
                        <span>•</span>
                        <Badge size="xs" className="bg-green-900 text-green-300 border border-green-700">
                          Open
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Branch info for non-PR events */}
              {!event.pr && event.branch && (
                <div className="mb-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Branch: </span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">{event.branch}</span>
                </div>
              )}

              {/* Commits summary */}
              {event.commits && event.commits.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {event.commits.length === 1 ? (
                      <>
                        <span className="font-mono">{event.commits[0].sha}</span>
                        <span className="text-green-600 dark:text-green-400">+{event.commits[0].insertions}</span>
                        <span className="text-red-600 dark:text-red-400">-{event.commits[0].deletions}</span>
                        <span>{event.commits[0].files_changed} file{event.commits[0].files_changed !== 1 ? 's' : ''}</span>
                      </>
                    ) : (
                      <>
                        <span>{event.commits.length} commits</span>
                        <span className="text-green-600 dark:text-green-400">
                          +{event.commits.reduce((sum, c) => sum + c.insertions, 0)}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          -{event.commits.reduce((sum, c) => sum + c.deletions, 0)}
                        </span>
                        <span>
                          {event.commits.reduce((sum, c) => sum + c.files_changed, 0)} file{event.commits.reduce((sum, c) => sum + c.files_changed, 0) !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* First commit message always visible */}
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {event.commits[0].message}
                  </div>

                  {/* Additional commits - expandable */}
                  {event.commits.length > 1 && (
                    <>
                      {isExpanded && (
                        <div className="space-y-1 mt-2">
                          {event.commits.slice(1).map(commit => (
                            <div key={commit.sha} className="pl-3 border-l-2 border-gray-300 dark:border-gray-600">
                              <div className="text-sm text-gray-700 dark:text-gray-300">{commit.message}</div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                <span className="font-mono">{commit.sha}</span>
                                <span className="text-green-600 dark:text-green-400">+{commit.insertions}</span>
                                <span className="text-red-600 dark:text-red-400">-{commit.deletions}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => toggleExpanded(event.id)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                      >
                        {isExpanded ? 'Show less' : `Show ${event.commits.length - 1} more commit${event.commits.length - 1 !== 1 ? 's' : ''}`}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Review body */}
              {event.review && (
                <div className={`p-3 rounded border ${
                  event.review.state === 'approved' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : event.review.state === 'changes_requested'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                } mb-2`}>
                  <div className="flex items-center gap-2 mb-2">
                    {event.review.state === 'approved' && (
                      <Badge size="xs" className="bg-green-700 text-green-100">
                        ✓ Approved
                      </Badge>
                    )}
                    {event.review.state === 'changes_requested' && (
                      <Badge size="xs" className="bg-red-700 text-red-100">
                        Changes Requested
                      </Badge>
                    )}
                    {event.review.state === 'commented' && (
                      <Badge size="xs" className="bg-gray-700 text-gray-300">
                        Commented
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {isExpanded || event.review.body.length <= 150 
                      ? event.review.body 
                      : `${event.review.body.slice(0, 150)}...`}
                  </p>
                  {event.review.body.length > 150 && (
                    <button
                      onClick={() => toggleExpanded(event.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              {/* Comment body */}
              {event.comment && (
                <div className="p-3 rounded bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 mb-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {isExpanded || event.comment.body.length <= 150 
                      ? event.comment.body 
                      : `${event.comment.body.slice(0, 150)}...`}
                  </p>
                  {event.comment.body.length > 150 && (
                    <button
                      onClick={() => toggleExpanded(event.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              {/* External link */}
              {(event.pr || event.comment) && (
                <a
                  href={event.pr?.url || event.comment?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View on GitHub
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
