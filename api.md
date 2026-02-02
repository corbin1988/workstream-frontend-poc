# Work Review Dashboard API Endpoints

## Table of Contents

### Work Feed Dashboard
1. [Get Work Items/Tickets Feed](#1-get-work-itemstickets-feed)
2. [Get Teams List](#2-get-teams-list)
3. [Search Work Items](#3-search-work-items)
4. [Get Leaderboard/User Recommendations](#4-get-leaderboarduser-recommendations)
5. [Follow/Unfollow User](#5-followunfollow-user)
6. [Get Standup Entries](#6-get-standup-entries)

### Work Review Session
7. [Get Work Items for Review](#7-get-work-items-for-review)
8. [Update Work Item Review Response](#8-update-work-item-review-response)
9. [Complete Review Session](#9-complete-review-session)
10. [Get Work Items for Daily Review Drawer](#10-get-work-items-for-daily-review-drawer)
11. [Update Work Item Triage Status](#11-update-work-item-triage-status)
12. [Add Work Item to Review Session](#12-add-work-item-to-review-session)

### Activity Feed (Git Webhooks)
13. [Webhook Receiver for Git Events](#13-webhook-receiver-for-git-events)
14. [Get Activity Feed](#14-get-activity-feed)
15. [Get Activity Event Details](#15-get-activity-event-details)

### Activity Feed (Git Webhooks)
13. [Webhook Receiver for Git Events](#13-webhook-receiver-for-git-events)
14. [Get Activity Feed](#14-get-activity-feed)
15. [Get Activity Event Details](#15-get-activity-event-details)

---

## 1. Get Work Items/Tickets Feed
**Jira Title:** API endpoint to fetch work items feed with filters  
**Summary:** Implement GET endpoint to retrieve paginated work items with team filtering support

**Endpoint:** `GET /api/v1/work-items`

**Query Parameters:**
```json
{
  "team_key": "string (optional)",
  "status_category": "string (optional)",
  "page": "number (optional, default: 1)",
  "limit": "number (optional, default: 20)"
}
```

**Response (200 OK):**
```json
{
  "data": [
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
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

## 2. Get Teams List
**Jira Title:** API endpoint to retrieve teams with work item counts  
**Summary:** Implement GET endpoint to fetch all teams with their current work item counts for filtering

**Endpoint:** `GET /api/v1/teams`

**Query Parameters:**
```json
{
  "include_counts": "boolean (optional, default: true)"
}
```

**Response (200 OK):**
```json
{
  "teams": [
    {
      "key": "API",
      "name": "API Team",
      "count": 12,
      "avatar_url": "https://example.com/avatars/api-team.png"
    },
    {
      "key": "INFRA",
      "name": "Infrastructure Team",
      "count": 8,
      "avatar_url": "https://example.com/avatars/infra-team.png"
    },
    {
      "key": "DATA",
      "name": "Data Team",
      "count": 5,
      "avatar_url": "https://example.com/avatars/data-team.png"
    }
  ],
  "total_items": 45
}
```

---

## 3. Search Work Items
**Jira Title:** API endpoint for work item search functionality  
**Summary:** Implement GET endpoint for full-text search across work items, assignees, and descriptions

**Endpoint:** `GET /api/v1/work-items/search`

**Query Parameters:**
```json
{
  "q": "string (required)",
  "team_key": "string (optional)",
  "limit": "number (optional, default: 20)"
}
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "issue_key": "ABC-123",
      "title": "Add authentication endpoint for mobile clients",
      "assignee": "Kate Martinez",
      "team": {
        "key": "API",
        "name": "API Team"
      },
      "status_category": "In Progress",
      "match_type": "title"
    }
  ],
  "total": 3
}
```

---

## 4. Get Leaderboard/User Recommendations
**Jira Title:** API endpoint for user leaderboard and follow suggestions  
**Summary:** Implement GET endpoint to retrieve top contributors and follow suggestions based on activity

**Endpoint:** `GET /api/v1/users/leaderboard`

**Query Parameters:**
```json
{
  "period": "string (optional, values: 'week', 'month', 'all-time', default: 'week')",
  "limit": "number (optional, default: 10)"
}
```

**Response (200 OK):**
```json
{
  "leaderboard": [
    {
      "user_id": "u123",
      "username": "Cyb3rDr34mer",
      "display_name": "Calvin Drag",
      "avatar_url": "https://i.pravatar.cc/150?img=1",
      "stats": {
        "tickets_completed": 12,
        "prs_merged": 8,
        "code_reviews": 15
      },
      "is_following": false
    },
    {
      "user_id": "u456",
      "username": "ivy_root_29",
      "display_name": "Ivy Root",
      "avatar_url": "https://i.pravatar.cc/150?img=5",
      "stats": {
        "tickets_completed": 10,
        "prs_merged": 12,
        "code_reviews": 20
      },
      "is_following": true
    }
  ],
  "period": "week"
}
```

---

## 5. Follow/Unfollow User
**Jira Title:** API endpoint for user follow/unfollow actions  
**Summary:** Implement POST endpoint to follow or unfollow users for personalized feed

**Endpoint:** `POST /api/v1/users/{user_id}/follow`

**Request Body:**
```json
{
  "action": "follow"
}
```

**Response (200 OK):**
```json
{
  "user_id": "u123",
  "is_following": true,
  "follower_count": 42
}
```

---

## 6. Get Standup Entries
**Jira Title:** API endpoint to retrieve standup entries for work items  
**Summary:** Implement GET endpoint to fetch daily standup updates linked to work items

**Endpoint:** `GET /api/v1/standup-entries`

**Query Parameters:**
```json
{
  "date": "string (optional, ISO date format)",
  "team_key": "string (optional)",
  "user_id": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "entries": [
    {
      "id": "se-001",
      "date": "2025-01-31",
      "user": "jdavis",
      "yesterday": "Fixed CI failure in integration tests",
      "today": "Refactor endpoint handler logic",
      "blockers": "Waiting on design review",
      "team_comment": "On track for sprint goal",
      "linked_tickets": [
        {
          "issue_key": "ABC-123"
        }
      ]
    }
  ],
  "date": "2025-01-31"
}
```

---

## 7. Get Work Items for Review
**Jira Title:** API endpoint to retrieve selected work items for review session  
**Summary:** Implement GET endpoint to fetch work items selected for daily review with their current status and context

**Endpoint:** `GET /api/v1/review-sessions/current`

**Query Parameters:**
```json
{
  "user_id": "string (optional, defaults to current user)"
}
```

**Response (200 OK):**
```json
{
  "session_id": "rs-20250131-u123",
  "date": "2025-01-31",
  "user_id": "u123",
  "work_items": [
    {
      "key": "ABC-123",
      "title": "Add authentication endpoint for mobile clients",
      "intent": "Enable mobile app users to authenticate securely",
      "status": "keep",
      "description": "Original problem statement or requirement",
      "assignee": "Kate Martinez",
      "priority": "High",
      "recent_changes": "Fixed CI failure in integration tests"
    },
    {
      "key": "ABC-156",
      "title": "Fix dashboard loading performance",
      "intent": "Reduce initial page load time for analytics dashboard",
      "status": "keep",
      "description": "Dashboard takes 5+ seconds to load",
      "assignee": "John Davis",
      "priority": "High"
    },
    {
      "key": "ABC-140",
      "title": "Refactor user permissions module",
      "intent": "Simplify permission logic and reduce technical debt",
      "status": "blocked",
      "description": "Current permission system is complex and hard to maintain",
      "assignee": "Sarah Chen",
      "priority": "Medium"
    }
  ],
  "total_items": 3,
  "reviewed_count": 0
}
```

---

## 8. Update Work Item Review Response
**Jira Title:** API endpoint to save user responses during review session  
**Summary:** Implement POST endpoint to capture and save user updates for each work item during the review session

**Endpoint:** `POST /api/v1/review-sessions/{session_id}/responses`

**Request Body:**
```json
{
  "work_item_key": "ABC-123",
  "question": "What did you accomplish yesterday with this item?",
  "response": "Fixed CI failure in integration tests",
  "timestamp": "2025-01-31T14:30:00Z"
}
```

**Response (200 OK):**
```json
{
  "session_id": "rs-20250131-u123",
  "work_item_key": "ABC-123",
  "response_saved": true,
  "next_question": "What are you planning to work on today?",
  "reviewed_count": 1,
  "total_items": 3
}
```

---

## 9. Complete Review Session
**Jira Title:** API endpoint to finalize and submit review session  
**Summary:** Implement POST endpoint to mark review session as complete and process all collected updates

**Endpoint:** `POST /api/v1/review-sessions/{session_id}/complete`

**Request Body:**
```json
{
  "completed_at": "2025-01-31T14:45:00Z",
  "summary": {
    "items_reviewed": 3,
    "items_completed": 1,
    "items_blocked": 1,
    "items_continuing": 1
  }
}
```

**Response (200 OK):**
```json
{
  "session_id": "rs-20250131-u123",
  "status": "completed",
  "completed_at": "2025-01-31T14:45:00Z",
  "updates_created": [
    {
      "work_item_key": "ABC-123",
      "update_id": "upd-001",
      "type": "daily_update"
    },
    {
      "work_item_key": "ABC-156",
      "update_id": "upd-002",
      "type": "daily_update"
    }
  ],
  "next_review_date": "2025-02-01"
}
```

---

## 10. Get Work Items for Daily Review Drawer
**Jira Title:** API endpoint to fetch categorized work items for review drawer  
**Summary:** Implement GET endpoint to retrieve work items organized by categories (continue from yesterday, active, suggested)

**Endpoint:** `GET /api/v1/review/work-items`

**Query Parameters:**
```json
{
  "user_id": "string (optional, defaults to current user)",
  "date": "string (optional, ISO date format)"
}
```

**Response (200 OK):**
```json
{
  "date": "2025-01-31",
  "continue_from_yesterday": [
    {
      "key": "ABC-123",
      "title": "Add authentication endpoint for mobile clients",
      "intent": "Enable mobile app users to authenticate securely",
      "has_changes": true,
      "last_update_date": "2025-01-30",
      "status_category": "In Progress",
      "assignee": "Kate Martinez"
    },
    {
      "key": "ABC-140",
      "title": "Refactor user permissions module",
      "intent": "Simplify permission logic and reduce technical debt",
      "has_changes": false,
      "last_update_date": "2025-01-29",
      "status_category": "In Progress",
      "assignee": "Kate Martinez"
    }
  ],
  "active_in_progress": [
    {
      "key": "ABC-156",
      "title": "Fix dashboard loading performance",
      "intent": "Reduce initial page load time for analytics dashboard",
      "why_here": "Assigned to you yesterday",
      "status_category": "In Progress",
      "assignee": "Kate Martinez"
    }
  ],
  "suggested": [
    {
      "key": "ABC-178",
      "title": "Update API documentation",
      "reason": "You recently committed to related files",
      "status_category": "To Do",
      "assignee": "Kate Martinez"
    },
    {
      "key": "ABC-201",
      "title": "Review security audit findings",
      "reason": "Tagged for your review by security team",
      "status_category": "To Do",
      "assignee": "Kate Martinez"
    }
  ]
}
```

---

## 11. Update Work Item Triage Status
**Jira Title:** API endpoint to update work item triage decisions  
**Summary:** Implement PATCH endpoint to save user's triage decisions (keep/done/blocked/notmine) and notes for work items

**Endpoint:** `PATCH /api/v1/work-items/{work_item_key}/triage`

**Request Body:**
```json
{
  "status": "keep",
  "note": "Waiting for design review before proceeding",
  "triaged_at": "2025-01-31T14:20:00Z"
}
```

**Response (200 OK):**
```json
{
  "work_item_key": "ABC-123",
  "triage_status": "keep",
  "note": "Waiting for design review before proceeding",
  "triaged_at": "2025-01-31T14:20:00Z",
  "updated": true
}
```

---

## 12. Add Work Item to Review Session
**Jira Title:** API endpoint to add work items to active review session  
**Summary:** Implement POST endpoint to dynamically add work items to the current review session from search results

**Endpoint:** `POST /api/v1/review-sessions/current/items`

**Request Body:**
```json
{
  "work_item_key": "ABC-189",
  "source": "manual_search",
  "reason": "Added manually by user"
}
```

**Response (200 OK):**
```json
{
  "session_id": "rs-20250131-u123",
  "work_item": {
    "key": "ABC-189",
    "title": "Implement real-time notifications",
    "intent": "Add real-time notification system for user alerts",
    "status": "keep",
    "assignee": "Kate Martinez"
  },
  "added": true,
  "total_items": 4
}
```

---

## 13. Webhook Receiver for Git Events
**Jira Title:** Webhook endpoint to receive and process Git/Bitbucket events  
**Summary:** Implement POST endpoint to receive webhook events from Git providers (GitHub, Bitbucket, GitLab) and process them into activity feed

**Endpoint:** `POST /api/v1/webhooks/git`

**Request Headers:**
```json
{
  "X-Webhook-Source": "github|bitbucket|gitlab",
  "X-Hub-Signature": "sha256=<signature>",
  "X-GitHub-Event": "push|pull_request|pull_request_review|pull_request_review_comment"
}
```

**Request Body (GitHub Push Event Example):**
```json
{
  "ref": "refs/heads/feature/ABC-123-add-endpoint",
  "repository": {
    "name": "api-service",
    "full_name": "company/api-service",
    "url": "https://github.com/company/api-service"
  },
  "pusher": {
    "name": "Kate Martinez",
    "email": "kate@company.com"
  },
  "commits": [
    {
      "id": "a3f8d9c",
      "message": "Add integration tests for auth endpoint",
      "timestamp": "2025-01-18T21:04:11Z",
      "added": ["tests/integration/auth.test.js"],
      "removed": [],
      "modified": ["src/auth/handler.js", "package.json"]
    }
  ]
}
```

**Request Body (Bitbucket Pull Request Event Example):**
```json
{
  "pullrequest": {
    "id": 456,
    "title": "Add authentication endpoint for mobile clients",
    "state": "OPEN",
    "source": {
      "branch": {
        "name": "feature/ABC-123-add-endpoint"
      }
    },
    "destination": {
      "branch": {
        "name": "main"
      }
    },
    "author": {
      "display_name": "Kate Martinez"
    },
    "links": {
      "html": {
        "href": "https://bitbucket.org/company/api-service/pull-requests/456"
      }
    }
  },
  "repository": {
    "name": "api-service",
    "full_name": "company/api-service"
  }
}
```

**Response (202 Accepted):**
```json
{
  "status": "accepted",
  "event_id": "evt-001",
  "processed": true,
  "activity_created": true,
  "message": "Webhook event received and queued for processing"
}
```

---

## 14. Get Activity Feed
**Jira Title:** API endpoint to retrieve git activity feed with team filtering  
**Summary:** Implement GET endpoint to fetch processed git activities from webhooks with pagination and filtering

**Endpoint:** `GET /api/v1/activities`

**Query Parameters:**
```json
{
  "team": "string (optional)",
  "repo": "string (optional)",
  "author": "string (optional)",
  "type": "string (optional, values: push|pr_opened|pr_merged|pr_review|pr_comment|branch_created|branch_deleted)",
  "since": "string (optional, ISO date format)",
  "page": "number (optional, default: 1)",
  "limit": "number (optional, default: 50)"
}
```

**Response (200 OK):**
```json
{
  "activities": [
    {
      "id": "evt-001",
      "type": "pr_review",
      "timestamp": "2025-01-18T22:15:00Z",
      "author": "Sarah Chen",
      "repo": "api-service",
      "team": "API Team",
      "pr": {
        "number": 456,
        "title": "Add authentication endpoint for mobile clients",
        "state": "open",
        "url": "https://github.com/company/api-service/pull/456",
        "base": "main",
        "head": "feature/ABC-123-add-endpoint"
      },
      "review": {
        "state": "approved",
        "body": "LGTM! Great work on the error handling."
      }
    },
    {
      "id": "evt-002",
      "type": "push",
      "timestamp": "2025-01-18T21:04:11Z",
      "author": "Kate Martinez",
      "repo": "api-service",
      "team": "API Team",
      "branch": "feature/ABC-123-add-endpoint",
      "commits": [
        {
          "sha": "a3f8d9c",
          "message": "Add integration tests for auth endpoint",
          "files_changed": 3,
          "insertions": 87,
          "deletions": 12
        },
        {
          "sha": "b2e7c1a",
          "message": "Refactor token validation logic",
          "files_changed": 2,
          "insertions": 45,
          "deletions": 38
        }
      ]
    },
    {
      "id": "evt-003",
      "type": "pr_comment",
      "timestamp": "2025-01-18T19:32:00Z",
      "author": "Mike Johnson",
      "repo": "api-service",
      "team": "API Team",
      "pr": {
        "number": 456,
        "title": "Add authentication endpoint for mobile clients",
        "state": "open",
        "url": "https://github.com/company/api-service/pull/456",
        "base": "main",
        "head": "feature/ABC-123-add-endpoint"
      },
      "comment": {
        "body": "Have we considered rate limiting for this endpoint?",
        "url": "https://github.com/company/api-service/pull/456#issuecomment-12345"
      }
    },
    {
      "id": "evt-004",
      "type": "pr_opened",
      "timestamp": "2025-01-18T16:45:00Z",
      "author": "Alex Thompson",
      "repo": "frontend-web",
      "team": "Frontend Team",
      "branch": "feature/XYZ-789-user-settings",
      "pr": {
        "number": 892,
        "title": "Add user preferences settings page",
        "state": "open",
        "url": "https://github.com/company/frontend-web/pull/892",
        "base": "main",
        "head": "feature/XYZ-789-user-settings"
      }
    },
    {
      "id": "evt-005",
      "type": "branch_created",
      "timestamp": "2025-01-18T14:20:00Z",
      "author": "David Lee",
      "repo": "mobile-app",
      "team": "Mobile Team",
      "branch": "hotfix/crash-on-startup"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 247,
    "total_pages": 5
  },
  "teams": [
    {
      "key": "API",
      "name": "API Team",
      "activity_count": 45
    },
    {
      "key": "FRONTEND",
      "name": "Frontend Team",
      "activity_count": 38
    },
    {
      "key": "DATA",
      "name": "Data Team",
      "activity_count": 22
    }
  ]
}
```

---

## 15. Get Activity Event Details
**Jira Title:** API endpoint to retrieve detailed information for activity event  
**Summary:** Implement GET endpoint to fetch full details of a specific activity event including all metadata

**Endpoint:** `GET /api/v1/activities/{event_id}`

**Response (200 OK):**
```json
{
  "id": "evt-002",
  "type": "push",
  "timestamp": "2025-01-18T21:04:11Z",
  "author": "Kate Martinez",
  "author_email": "kate@company.com",
  "repo": "api-service",
  "repo_url": "https://github.com/company/api-service",
  "team": "API Team",
  "branch": "feature/ABC-123-add-endpoint",
  "commits": [
    {
      "sha": "a3f8d9c",
      "message": "Add integration tests for auth endpoint",
      "timestamp": "2025-01-18T21:04:11Z",
      "url": "https://github.com/company/api-service/commit/a3f8d9c",
      "files_changed": 3,
      "insertions": 87,
      "deletions": 12,
      "files": [
        {
          "filename": "tests/integration/auth.test.js",
          "status": "added",
          "additions": 65,
          "deletions": 0
        },
        {
          "filename": "src/auth/handler.js",
          "status": "modified",
          "additions": 20,
          "deletions": 10
        },
        {
          "filename": "package.json",
          "status": "modified",
          "additions": 2,
          "deletions": 2
        }
      ]
    },
    {
      "sha": "b2e7c1a",
      "message": "Refactor token validation logic",
      "timestamp": "2025-01-18T20:48:32Z",
      "url": "https://github.com/company/api-service/commit/b2e7c1a",
      "files_changed": 2,
      "insertions": 45,
      "deletions": 38,
      "files": [
        {
          "filename": "src/auth/validator.js",
          "status": "modified",
          "additions": 35,
          "deletions": 28
        },
        {
          "filename": "src/auth/types.ts",
          "status": "modified",
          "additions": 10,
          "deletions": 10
        }
      ]
    }
  ],
  "linked_work_items": [
    {
      "issue_key": "ABC-123",
      "title": "Add authentication endpoint for mobile clients"
    }
  ],
  "webhook_source": "github",
  "raw_event_url": "/api/v1/webhooks/events/evt-002/raw"
}
```

