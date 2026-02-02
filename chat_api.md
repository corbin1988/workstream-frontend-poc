# Context-Aware Chat API Endpoints

## Table of Contents

1. [Send Chat Message](#1-send-chat-message)
2. [Get Suggested Prompts](#2-get-suggested-prompts)
3. [Create Chat Conversation](#3-create-chat-conversation)
4. [Get All Conversations](#4-get-all-conversations)
5. [Get Chat Conversation](#5-get-chat-conversation)
6. [Get Available Context Sources](#6-get-available-context-sources)
7. [Stream Chat Response](#7-stream-chat-response)

---

## 1. Send Chat Message
**Jira Title:** API endpoint to send chat message and receive AI response  
**Summary:** Implement POST endpoint to send user message with optional context scope and receive AI-generated response with references to work items, reviews, and documentation

**Endpoint:** `POST /api/v1/chat/messages`

**Request Body:**
```json
{
  "conversation_id": "conv-123",
  "message": "What is Jordan blocked on right now?",
  "context_scope": {
    "domains": ["work_state", "work_review", "documentation"],
    "filters": {
      "team_keys": ["API", "INFRA"],
      "date_range": {
        "start": "2025-01-01",
        "end": "2025-01-31"
      },
      "work_item_keys": ["ABC-123"],
      "document_paths": ["architecture/auth.md"]
    }
  }
}
```

**Response (200 OK):**
```json
{
  "message_id": "msg-456",
  "conversation_id": "conv-123",
  "role": "assistant",
  "content": "Jordan is currently blocked on ABC-156 (Fix dashboard loading performance) due to waiting on the database migration to complete. This blocker was noted in today's standup and also appears in the last work review from January 28.",
  "timestamp": "2025-01-31T15:30:00Z",
  "references": [
    {
      "type": "ticket",
      "id": "ABC-156",
      "title": "Fix dashboard loading performance",
      "url": "/work-items/ABC-156",
      "context": "Current blocker: database migration pending"
    },
    {
      "type": "review",
      "id": "review-20250128",
      "title": "Work Review - January 28, 2025",
      "url": "/reviews/20250128",
      "context": "Jordan noted performance issues with current schema"
    },
    {
      "type": "document",
      "id": "db-migration-guide",
      "title": "Database Migration Guidelines",
      "url": "/docs/db-migration-guide.md",
      "context": "Section on performance optimization strategies"
    }
  ],
  "evidence_sections": [
    {
      "title": "Current Work State",
      "items": [
        {
          "type": "ticket",
          "key": "ABC-156",
          "status": "blocked",
          "assignee": "Jordan Smith"
        }
      ]
    },
    {
      "title": "Recent Review Notes",
      "items": [
        {
          "type": "review_comment",
          "review_id": "review-20250128",
          "author": "Jordan Smith",
          "excerpt": "Waiting on DBA team to complete index optimization"
        }
      ]
    }
  ],
  "follow_up_suggestions": [
    "Who else is working on database-related tasks?",
    "What's the timeline for the database migration?",
    "Show me all blocked items this week"
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "invalid_context",
  "message": "Unable to resolve context scope: invalid team key 'INVALID'",
  "timestamp": "2025-01-31T15:30:00Z"
}
```

---

## 2. Get Suggested Prompts
**Jira Title:** API endpoint to retrieve contextual suggested prompts  
**Summary:** Implement GET endpoint to fetch dynamically generated suggested prompts based on current workspace context, user activity, and recent work

**Endpoint:** `GET /api/v1/chat/suggested-prompts`

**Query Parameters:**
```json
{
  "context_type": "string (optional, values: 'global', 'work_item', 'review', 'document')",
  "context_id": "string (optional, e.g., 'ABC-123', 'review-20250128')",
  "limit": "number (optional, default: 5)"
}
```

**Response (200 OK):**
```json
{
  "prompts": [
    {
      "id": "prompt-1",
      "text": "What tasks are currently in progress?",
      "category": "work_state",
      "context_hint": "12 items in progress across 3 teams"
    },
    {
      "id": "prompt-2",
      "text": "Summarize recent team activity",
      "category": "work_state",
      "context_hint": "Activity from past 7 days"
    },
    {
      "id": "prompt-3",
      "text": "What documentation exists for authentication?",
      "category": "documentation",
      "context_hint": "3 documents found"
    },
    {
      "id": "prompt-4",
      "text": "What decisions led to the OAuth implementation?",
      "category": "work_review",
      "context_hint": "Referenced in 2 past reviews"
    },
    {
      "id": "prompt-5",
      "text": "Show me active work related to API rate limiting",
      "category": "cross_context",
      "context_hint": "2 tickets, 1 document, 1 review"
    }
  ],
  "context": {
    "type": "global",
    "generated_at": "2025-01-31T15:30:00Z"
  }
}
```

**Response (200 OK - Contextual, for work item):**
```json
{
  "prompts": [
    {
      "id": "prompt-ctx-1",
      "text": "What's the history of this ticket?",
      "category": "work_state",
      "context_hint": "ABC-123 created 14 days ago"
    },
    {
      "id": "prompt-ctx-2",
      "text": "Show related documentation for this feature",
      "category": "documentation",
      "context_hint": "2 architecture docs reference authentication"
    },
    {
      "id": "prompt-ctx-3",
      "text": "Has this been discussed in recent reviews?",
      "category": "work_review",
      "context_hint": "Mentioned in last review"
    }
  ],
  "context": {
    "type": "work_item",
    "id": "ABC-123",
    "title": "Add authentication endpoint for mobile clients",
    "generated_at": "2025-01-31T15:30:00Z"
  }
}
```

---

## 3. Create Chat Conversation
**Jira Title:** API endpoint to create new chat conversation  
**Summary:** Implement POST endpoint to start a new chat conversation with optional initial context seeding

**Endpoint:** `POST /api/v1/chat/conversations`

**Request Body:**
```json
{
  "title": "Authentication Implementation Discussion",
  "initial_context": {
    "type": "work_item",
    "id": "ABC-123"
  },
  "context_scope": {
    "domains": ["work_state", "documentation"]
  }
}
```

**Response (201 Created):**
```json
{
  "conversation_id": "conv-789",
  "title": "Authentication Implementation Discussion",
  "created_at": "2025-01-31T15:30:00Z",
  "context": {
    "type": "work_item",
    "id": "ABC-123",
    "title": "Add authentication endpoint for mobile clients"
  },
  "message_count": 0,
  "last_activity": "2025-01-31T15:30:00Z"
}
```

---

## 4. Get All Conversations
**Jira Title:** API endpoint to retrieve all chat conversations  
**Summary:** Implement GET endpoint to fetch paginated list of all user conversations with metadata and recent activity

**Endpoint:** `GET /api/v1/chat/conversations`

**Query Parameters:**
```json
{
  "limit": "number (optional, default: 20)",
  "offset": "number (optional, default: 0)",
  "sort_by": "string (optional, values: 'last_activity', 'created_at', default: 'last_activity')",
  "order": "string (optional, values: 'asc', 'desc', default: 'desc')",
  "context_type": "string (optional, filter by context type: 'global', 'work_item', 'review', 'document')"
}
```

**Response (200 OK):**
```json
{
  "conversations": [
    {
      "conversation_id": "conv-123",
      "title": "Work Status Check",
      "created_at": "2025-01-31T14:00:00Z",
      "last_activity": "2025-01-31T15:30:00Z",
      "message_count": 8,
      "context": {
        "type": "global"
      },
      "last_message_preview": "Jordan is currently blocked on ABC-156...",
      "participants": [
        {
          "user_id": "u123",
          "username": "kate.martinez",
          "role": "user"
        }
      ]
    },
    {
      "conversation_id": "conv-789",
      "title": "Authentication Implementation Discussion",
      "created_at": "2025-01-30T10:00:00Z",
      "last_activity": "2025-01-30T16:45:00Z",
      "message_count": 15,
      "context": {
        "type": "work_item",
        "id": "ABC-123",
        "title": "Add authentication endpoint for mobile clients"
      },
      "last_message_preview": "Based on the documentation, OAuth was chosen because...",
      "participants": [
        {
          "user_id": "u123",
          "username": "kate.martinez",
          "role": "user"
        }
      ]
    },
    {
      "conversation_id": "conv-456",
      "title": "API Rate Limiting Review",
      "created_at": "2025-01-29T09:15:00Z",
      "last_activity": "2025-01-29T11:30:00Z",
      "message_count": 6,
      "context": {
        "type": "document",
        "id": "api-rate-limiting",
        "title": "API Rate Limiting Strategy"
      },
      "last_message_preview": "The current rate limiting configuration is documented in...",
      "participants": [
        {
          "user_id": "u123",
          "username": "kate.martinez",
          "role": "user"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 23,
    "has_more": true
  }
}
```

---

## 5. Get Chat Conversation
**Jira Title:** API endpoint to retrieve chat conversation history  
**Summary:** Implement GET endpoint to fetch conversation details and full message history with references

**Endpoint:** `GET /api/v1/chat/conversations/{conversation_id}`

**Query Parameters:**
```json
{
  "include_messages": "boolean (optional, default: true)",
  "limit": "number (optional, default: 50)",
  "before_message_id": "string (optional, for pagination)"
}
```

**Response (200 OK):**
```json
{
  "conversation_id": "conv-123",
  "title": "Work Status Check",
  "created_at": "2025-01-31T14:00:00Z",
  "last_activity": "2025-01-31T15:30:00Z",
  "context": {
    "type": "global",
    "scope": {
      "domains": ["work_state", "work_review", "documentation"]
    }
  },
  "messages": [
    {
      "message_id": "msg-001",
      "role": "user",
      "content": "What is Jordan blocked on right now?",
      "timestamp": "2025-01-31T15:25:00Z"
    },
    {
      "message_id": "msg-002",
      "role": "assistant",
      "content": "Jordan is currently blocked on ABC-156...",
      "timestamp": "2025-01-31T15:25:30Z",
      "references": [
        {
          "type": "ticket",
          "id": "ABC-156",
          "title": "Fix dashboard loading performance",
          "url": "/work-items/ABC-156"
        }
      ],
      "follow_up_suggestions": [
        "Who else is working on database-related tasks?",
        "What's the timeline for the database migration?"
      ]
    }
  ],
  "message_count": 2,
  "pagination": {
    "has_more": false,
    "next_cursor": null
  }
}
```

---

## 6. Get Available Context Sources
**Jira Title:** API endpoint to retrieve available context sources for chat  
**Summary:** Implement GET endpoint to fetch summary of available context data (work items, reviews, documentation) that can be queried

**Endpoint:** `GET /api/v1/chat/context`

**Query Parameters:**
```json
{
  "domains": "string[] (optional, e.g., ['work_state', 'documentation'])",
  "team_keys": "string[] (optional)"
}
```

**Response (200 OK):**
```json
{
  "available_context": {
    "work_state": {
      "total_tickets": 45,
      "in_progress": 12,
      "blocked": 3,
      "teams": ["API", "INFRA", "DATA"],
      "date_range": {
        "earliest": "2024-12-01",
        "latest": "2025-01-31"
      }
    },
    "work_review": {
      "total_reviews": 8,
      "date_range": {
        "earliest": "2024-12-15",
        "latest": "2025-01-28"
      },
      "total_decisions": 23,
      "total_summaries": 8
    },
    "documentation": {
      "total_documents": 156,
      "categories": [
        {
          "name": "Architecture",
          "count": 23,
          "paths": ["architecture/", "adrs/"]
        },
        {
          "name": "API Documentation",
          "count": 45,
          "paths": ["api/"]
        },
        {
          "name": "Operations",
          "count": 18,
          "paths": ["operations/", "runbooks/"]
        }
      ],
      "last_updated": "2025-01-30T10:00:00Z"
    }
  },
  "indexed_at": "2025-01-31T15:00:00Z"
}
```

---

## 7. Stream Chat Response
**Jira Title:** API endpoint for streaming chat responses  
**Summary:** Implement Server-Sent Events (SSE) endpoint to stream AI responses in real-time for improved user experience

**Endpoint:** `POST /api/v1/chat/messages/stream`

**Request Body:**
```json
{
  "conversation_id": "conv-123",
  "message": "What is Jordan blocked on right now?",
  "context_scope": {
    "domains": ["work_state", "work_review"]
  }
}
```

**Response (200 OK - SSE Stream):**
```
event: message_start
data: {"message_id": "msg-456", "timestamp": "2025-01-31T15:30:00Z"}

event: content_delta
data: {"delta": "Jordan is currently "}

event: content_delta
data: {"delta": "blocked on ABC-156 "}

event: content_delta
data: {"delta": "(Fix dashboard loading performance) "}

event: reference_found
data: {"type": "ticket", "id": "ABC-156", "title": "Fix dashboard loading performance"}

event: content_delta
data: {"delta": "due to waiting on the database migration to complete."}

event: reference_found
data: {"type": "review", "id": "review-20250128", "title": "Work Review - January 28, 2025"}

event: evidence_section
data: {"title": "Current Work State", "items": [{"type": "ticket", "key": "ABC-156", "status": "blocked"}]}

event: follow_up_suggestions
data: {"suggestions": ["Who else is working on database-related tasks?", "What's the timeline for the database migration?"]}

event: message_complete
data: {"message_id": "msg-456", "timestamp": "2025-01-31T15:30:30Z", "total_references": 2}
```

**Error Event:**
```
event: error
data: {"error": "context_unavailable", "message": "Unable to access work review data", "timestamp": "2025-01-31T15:30:00Z"}
```

---

## Implementation Notes

### Context Resolution Strategy

The chat system resolves context in the following priority order:

1. **Explicit Context** - User-specified work items, documents, or reviews
2. **Conversational Context** - Previously referenced items in the conversation
3. **User Context** - User's team, assigned work, recent activity
4. **Global Context** - All available data within access permissions

### Reference Linking

All references returned by the API include:
- **type**: The domain of the reference (ticket, document, review)
- **id**: Unique identifier for the item
- **title**: Human-readable title
- **url**: Direct link to the item in the application
- **context**: Optional excerpt or explanation of relevance

### Guardrails

The AI response system enforces:
- No speculative or hallucinated data
- Explicit statements when context is missing or insufficient
- Clear distinction between documented intent, observed behavior, and historical decisions
- All answers must be traceable to source artifacts

### Caching Strategy

To optimize performance:
- Context summaries are cached for 5 minutes
- Document embeddings are pre-computed and indexed
- Work state queries use real-time data
- Review data is immutable and can be aggressively cached
