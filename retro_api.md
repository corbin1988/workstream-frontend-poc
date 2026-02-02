# Retrospective Summary API Endpoints

## Table of Contents

### Retrospective Management
1. [Get Retrospective Summaries List](#1-get-retrospective-summaries-list)
2. [Get Retrospective Summary Details](#2-get-retrospective-summary-details)
3. [Generate Retrospective Summary](#3-generate-retrospective-summary)
4. [Update Retrospective Summary](#4-update-retrospective-summary)
5. [Add Sign-off Approval](#5-add-sign-off-approval)
6. [Add Comment to Retrospective](#6-add-comment-to-retrospective)
7. [Export Retrospective as PDF](#7-export-retrospective-as-pdf)
8. [Generate Share Link](#8-generate-share-link)

### Documentation & Knowledge Base (RAG System)
9. [Get Documentation List](#9-get-documentation-list)
10. [Get Documentation by ID](#10-get-documentation-by-id)
11. [Create Documentation](#11-create-documentation)
12. [Update Documentation](#12-update-documentation)
13. [Delete Documentation](#13-delete-documentation)
14. [Generate Embeddings for Documentation](#14-generate-embeddings-for-documentation)
15. [Search Documentation (RAG)](#15-search-documentation-rag)
16. [AI-Assisted Documentation Generation](#16-ai-assisted-documentation-generation)

---

## 1. Get Retrospective Summaries List
**Jira Title:** API endpoint to retrieve paginated retrospective summaries  
**Summary:** Implement GET endpoint to fetch list of retrospective summaries with filtering and pagination support

**Endpoint:** `GET /api/v1/retrospectives`

**Query Parameters:**
```json
{
  "scope": "string (optional, values: 'individual', 'multiple', 'all')",
  "team": "string (optional)",
  "status": "string (optional, values: 'draft', 'pending_approval', 'approved')",
  "date_from": "string (optional, ISO date format)",
  "date_to": "string (optional, ISO date format)",
  "page": "number (optional, default: 1)",
  "limit": "number (optional, default: 20)"
}
```

**Response (200 OK):**
```json
{
  "summaries": [
    {
      "id": "retro-001",
      "date_range": {
        "start": "2024-12-06",
        "end": "2024-12-20"
      },
      "scope": "All Teams",
      "preview": "Authentication service v2 migration reached 65% completion with core token management...",
      "status": "pending_approval",
      "approved_count": 3,
      "total_signoffs": 6,
      "is_fully_approved": false,
      "created_at": "2024-12-21T08:00:00Z",
      "created_by": "system",
      "last_updated": "2024-12-21T11:05:00Z"
    },
    {
      "id": "retro-002",
      "date_range": {
        "start": "2024-11-22",
        "end": "2024-12-05"
      },
      "scope": "All Teams",
      "preview": "Q4 sprint planning completed with resource allocation finalized...",
      "status": "approved",
      "approved_count": 4,
      "total_signoffs": 4,
      "is_fully_approved": true,
      "created_at": "2024-12-06T09:00:00Z",
      "created_by": "system",
      "last_updated": "2024-12-06T16:30:00Z"
    },
    {
      "id": "retro-003",
      "date_range": {
        "start": "2024-11-08",
        "end": "2024-11-21"
      },
      "scope": "API Team",
      "preview": "REST API v3 beta release with improved rate limiting and response caching...",
      "status": "approved",
      "approved_count": 2,
      "total_signoffs": 2,
      "is_fully_approved": true,
      "created_at": "2024-11-22T10:00:00Z",
      "created_by": "system",
      "last_updated": "2024-11-22T14:20:00Z"
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

## 2. Get Retrospective Summary Details
**Jira Title:** API endpoint to retrieve detailed retrospective summary  
**Summary:** Implement GET endpoint to fetch complete retrospective including executive overview, team summaries, risks, sign-offs, and comments

**Endpoint:** `GET /api/v1/retrospectives/{retrospective_id}`

**Response (200 OK):**
```json
{
  "id": "retro-001",
  "date_range": {
    "start": "2024-12-06",
    "end": "2024-12-20"
  },
  "scope": "All Teams",
  "status": "pending_approval",
  "executive_overview": "Authentication service v2 migration reached 65% completion with core token management implemented and tested. Payment processing integration advanced through contract definition and initial implementation phases. Infrastructure capacity planning transitioned from analysis to execution with monitoring systems deployed. Two critical dependency resolutions unblocked parallel workstreams. Remaining uncertainty centers on third-party API stability and final performance validation timelines.",
  "team_summaries": [
    {
      "team": "API Team",
      "completed": [
        "Token refresh mechanism",
        "JWT validation service",
        "Rate limiting implementation"
      ],
      "in_progress": [
        "OAuth2 provider integration",
        "Session management refactor"
      ],
      "blockers": [
        "Third-party OAuth provider rate limits affecting test coverage"
      ],
      "decisions": [
        "Selected JWT over session tokens for stateless auth",
        "Committed to backward compatibility for 6 months"
      ],
      "evidence": {
        "prs": 12,
        "tickets": 8,
        "decisions": 3
      }
    },
    {
      "team": "Infrastructure",
      "completed": [
        "Monitoring dashboard deployment",
        "Log aggregation setup",
        "Database read replica configuration"
      ],
      "in_progress": [
        "Auto-scaling policy tuning",
        "Backup automation implementation"
      ],
      "blockers": [
        "Cloud provider quota increase pending approval"
      ],
      "decisions": [
        "Adopted Prometheus over CloudWatch for cost efficiency",
        "Standardized on UTC timestamps across all services"
      ],
      "evidence": {
        "prs": 8,
        "tickets": 5,
        "decisions": 2
      }
    },
    {
      "team": "Data Team",
      "completed": [
        "ETL pipeline optimization",
        "Analytics event schema v2",
        "Data retention policy implementation"
      ],
      "in_progress": [
        "Real-time processing migration",
        "Historical data backfill"
      ],
      "blockers": [],
      "decisions": [
        "Moved to incremental processing model",
        "Established 90-day hot storage policy"
      ],
      "evidence": {
        "prs": 10,
        "tickets": 6,
        "decisions": 2
      }
    }
  ],
  "cross_team_progress": [
    "End-to-end authentication flow validated across API and infrastructure layers",
    "Unified logging format adopted enabling cross-service debugging",
    "Payment webhook handling architecture agreed upon between API and Data teams",
    "Database migration strategy aligned with infrastructure capacity planning"
  ],
  "risks": [
    "OAuth provider rate limits may require fallback authentication mechanism",
    "Cloud quota approval timeline uncertain, could delay auto-scaling deployment by 1-2 weeks",
    "Third-party payment API stability under load remains unvalidated",
    "Historical data backfill duration not yet estimated, may impact analytics availability"
  ],
  "sign_offs": [
    {
      "user_id": "u001",
      "name": "Jordan Davis",
      "team": "API Team",
      "approved": false,
      "timestamp": null,
      "comment": null
    },
    {
      "user_id": "u002",
      "name": "Alex Chen",
      "team": "API Team",
      "approved": true,
      "timestamp": "2024-12-21T09:30:00Z",
      "comment": "OAuth blocker is accurate. Timeline looks good."
    },
    {
      "user_id": "u003",
      "name": "Sam Rivera",
      "team": "Infrastructure",
      "approved": true,
      "timestamp": "2024-12-21T10:15:00Z",
      "comment": null
    },
    {
      "user_id": "u004",
      "name": "Morgan Lee",
      "team": "Infrastructure",
      "approved": false,
      "timestamp": null,
      "comment": null
    },
    {
      "user_id": "u005",
      "name": "Casey Wong",
      "team": "Data Team",
      "approved": true,
      "timestamp": "2024-12-21T11:00:00Z",
      "comment": "Data retention policy correctly reflected."
    },
    {
      "user_id": "u006",
      "name": "Taylor Kim",
      "team": "Data Team",
      "approved": false,
      "timestamp": null,
      "comment": null
    }
  ],
  "comments": [
    {
      "id": "cmt-001",
      "author": "Alex Chen",
      "user_id": "u002",
      "team": "API Team",
      "timestamp": "2024-12-21T09:32:00Z",
      "content": "The OAuth provider rate limit issue is being actively worked. We have a meeting scheduled with the vendor on Dec 23."
    },
    {
      "id": "cmt-002",
      "author": "Casey Wong",
      "user_id": "u005",
      "team": "Data Team",
      "timestamp": "2024-12-21T11:05:00Z",
      "content": "Historical backfill estimate: ~3 weeks based on current processing rate. Will have exact timeline by EOW."
    }
  ],
  "metadata": {
    "created_at": "2024-12-21T08:00:00Z",
    "created_by": "system",
    "last_updated": "2024-12-21T11:05:00Z",
    "generation_config": {
      "date_range": {
        "start": "2024-12-06",
        "end": "2024-12-20"
      },
      "scope": "all",
      "audience": "technical"
    }
  }
}
```

---

## 3. Generate Retrospective Summary
**Jira Title:** API endpoint to generate AI-powered retrospective summary  
**Summary:** Implement POST endpoint to trigger AI generation of retrospective summary from work artifacts with configurable parameters

**Endpoint:** `POST /api/v1/retrospectives/generate`

**Request Body:**
```json
{
  "date_range": {
    "start": "2024-12-06",
    "end": "2024-12-20"
  },
  "scope": "all",
  "teams": ["API Team", "Infrastructure", "Data Team"],
  "audience": "technical",
  "include_evidence": true
}
```

**Response (202 Accepted):**
```json
{
  "job_id": "gen-job-001",
  "status": "processing",
  "estimated_completion": "2024-12-21T08:05:00Z",
  "message": "Retrospective generation started. Processing work artifacts...",
  "poll_url": "/api/v1/retrospectives/jobs/gen-job-001"
}
```

**Poll Status Response (200 OK):**
```json
{
  "job_id": "gen-job-001",
  "status": "completed",
  "retrospective_id": "retro-001",
  "completed_at": "2024-12-21T08:03:45Z",
  "retrospective_url": "/api/v1/retrospectives/retro-001"
}
```

---

## 4. Update Retrospective Summary
**Jira Title:** API endpoint to update retrospective summary content  
**Summary:** Implement PATCH endpoint to allow editing of retrospective summary sections before final approval

**Endpoint:** `PATCH /api/v1/retrospectives/{retrospective_id}`

**Request Body:**
```json
{
  "executive_overview": "Updated executive overview text...",
  "team_summaries": [
    {
      "team": "API Team",
      "completed": ["Updated item 1", "Updated item 2"],
      "in_progress": ["Updated in progress item"],
      "blockers": ["Updated blocker"],
      "decisions": ["Updated decision"]
    }
  ],
  "risks": ["Updated risk 1", "Updated risk 2"],
  "cross_team_progress": ["Updated progress item"]
}
```

**Response (200 OK):**
```json
{
  "id": "retro-001",
  "updated": true,
  "last_updated": "2024-12-21T14:30:00Z",
  "updated_by": "u007",
  "message": "Retrospective summary updated successfully"
}
```

---

## 5. Add Sign-off Approval
**Jira Title:** API endpoint to submit sign-off approval for retrospective  
**Summary:** Implement POST endpoint to allow team members to approve or reject retrospective summary with optional comments

**Endpoint:** `POST /api/v1/retrospectives/{retrospective_id}/sign-offs`

**Request Body:**
```json
{
  "user_id": "u002",
  "approved": true,
  "comment": "OAuth blocker is accurate. Timeline looks good."
}
```

**Response (200 OK):**
```json
{
  "retrospective_id": "retro-001",
  "sign_off": {
    "user_id": "u002",
    "name": "Alex Chen",
    "team": "API Team",
    "approved": true,
    "timestamp": "2024-12-21T09:30:00Z",
    "comment": "OAuth blocker is accurate. Timeline looks good."
  },
  "summary": {
    "approved_count": 3,
    "total_signoffs": 6,
    "is_fully_approved": false,
    "pending_approvers": ["Jordan Davis", "Morgan Lee", "Taylor Kim"]
  }
}
```

---

## 6. Add Comment to Retrospective
**Jira Title:** API endpoint to add comments to retrospective summary  
**Summary:** Implement POST endpoint to allow team members to add discussion comments to retrospective

**Endpoint:** `POST /api/v1/retrospectives/{retrospective_id}/comments`

**Request Body:**
```json
{
  "user_id": "u002",
  "content": "The OAuth provider rate limit issue is being actively worked. We have a meeting scheduled with the vendor on Dec 23."
}
```

**Response (201 Created):**
```json
{
  "comment": {
    "id": "cmt-003",
    "retrospective_id": "retro-001",
    "author": "Alex Chen",
    "user_id": "u002",
    "team": "API Team",
    "timestamp": "2024-12-21T09:32:00Z",
    "content": "The OAuth provider rate limit issue is being actively worked. We have a meeting scheduled with the vendor on Dec 23."
  },
  "total_comments": 3
}
```

---

## 7. Export Retrospective as PDF
**Jira Title:** API endpoint to export retrospective summary as PDF  
**Summary:** Implement POST endpoint to generate PDF export of retrospective summary for distribution

**Endpoint:** `POST /api/v1/retrospectives/{retrospective_id}/export/pdf`

**Request Body:**
```json
{
  "include_comments": true,
  "include_sign_offs": true,
  "include_evidence": false,
  "format": "executive"
}
```

**Response (200 OK):**
```json
{
  "export_id": "exp-pdf-001",
  "status": "ready",
  "download_url": "https://cdn.example.com/exports/retro-001-20241221.pdf",
  "expires_at": "2024-12-28T08:00:00Z",
  "file_size_bytes": 524288,
  "generated_at": "2024-12-21T14:00:00Z"
}
```

---

## 8. Generate Share Link
**Jira Title:** API endpoint to create shareable read-only link for retrospective  
**Summary:** Implement POST endpoint to generate secure, time-limited read-only links for external stakeholders

**Endpoint:** `POST /api/v1/retrospectives/{retrospective_id}/share`

**Request Body:**
```json
{
  "access_level": "read_only",
  "expires_in_days": 30,
  "require_password": false,
  "allowed_domains": ["example.com"]
}
```

**Response (201 Created):**
```json
{

---

## 9. Get Documentation List
**Jira Title:** API endpoint to retrieve paginated documentation entries  
**Summary:** Implement GET endpoint to fetch list of documentation with filtering, search, and pagination support

**Endpoint:** `GET /api/v1/documentation`

**Query Parameters:**
```json
{
  "search": "string (optional)",
  "tags": "array of strings (optional)",
  "category": "string (optional)",
  "created_by": "string (optional)",
  "updated_since": "string (optional, ISO date format)",
  "sort_by": "string (optional, values: 'created_at', 'updated_at', 'title', 'relevance')",
  "sort_order": "string (optional, values: 'asc', 'desc', default: 'desc')",
  "page": "number (optional, default: 1)",
  "limit": "number (optional, default: 20)"
}
```

**Response (200 OK):**
```json
{
  "documents": [
    {
      "id": "doc-001",
      "title": "API Authentication Guide",
      "slug": "api-authentication-guide",
      "preview": "Complete guide to implementing authentication in our API services including JWT tokens, OAuth2 flows...",
      "category": "API",
      "tags": ["authentication", "security", "jwt", "oauth2"],
      "created_by": {
        "user_id": "u001",
        "name": "Alex Chen"
      },
      "created_at": "2024-12-15T10:00:00Z",
      "updated_at": "2024-12-20T14:30:00Z",
      "word_count": 1247,
      "read_time_minutes": 6,
      "has_embeddings": true
    },
    {
      "id": "doc-002",
      "title": "Database Migration Best Practices",
      "slug": "database-migration-best-practices",
      "preview": "Best practices and guidelines for performing database migrations with zero downtime...",
      "category": "Infrastructure",
      "tags": ["database", "migrations", "postgres"],
      "created_by": {
        "user_id": "u003",
        "name": "Sam Rivera"
      },
      "created_at": "2024-12-10T09:00:00Z",
      "updated_at": "2024-12-18T11:00:00Z",
      "word_count": 892,
      "read_time_minutes": 4,
      "has_embeddings": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  },
  "categories": [
    { "name": "API", "count": 23 },
    { "name": "Infrastructure", "count": 18 },
    { "name": "Frontend", "count": 31 },
    { "name": "Data", "count": 15 }
  ]
}
```

---

## 10. Get Documentation by ID
**Jira Title:** API endpoint to retrieve single documentation entry with full content  
**Summary:** Implement GET endpoint to fetch complete documentation including markdown content and metadata

**Endpoint:** `GET /api/v1/documentation/{document_id}`

**Response (200 OK):**
```json
{
  "id": "doc-001",
  "title": "API Authentication Guide",
  "slug": "api-authentication-guide",
  "content": "# API Authentication Guide\n\n## Overview\n\nThis guide covers authentication implementation...",
  "content_html": "<h1>API Authentication Guide</h1><h2>Overview</h2><p>This guide covers authentication implementation...</p>",
  "category": "API",
  "tags": ["authentication", "security", "jwt", "oauth2"],
  "created_by": {
    "user_id": "u001",
    "name": "Alex Chen",
    "avatar_url": "https://example.com/avatars/u001.jpg"
  },
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2024-12-20T14:30:00Z",
  "updated_by": {
    "user_id": "u001",
    "name": "Alex Chen"
  },
  "version": 3,
  "word_count": 1247,
  "read_time_minutes": 6,
  "has_embeddings": true,
  "embedding_status": "completed",
  "related_documents": [
    {
      "id": "doc-015",
      "title": "OAuth2 Implementation Details",
      "similarity_score": 0.87
    },
    {
      "id": "doc-023",
      "title": "JWT Token Management",
      "similarity_score": 0.82
    }
  ],
  "metadata": {
    "last_accessed": "2024-12-21T09:15:00Z",
    "view_count": 142,
    "linked_work_items": ["ABC-123", "ABC-156"]
  }
}
```

---

## 11. Create Documentation
**Jira Title:** API endpoint to create new documentation entry  
**Summary:** Implement POST endpoint to create new documentation with automatic embedding generation

**Endpoint:** `POST /api/v1/documentation`

**Request Body:**
```json
{
  "title": "API Authentication Guide",
  "content": "# API Authentication Guide\n\n## Overview\n\nThis guide covers authentication implementation...",
  "category": "API",
  "tags": ["authentication", "security", "jwt", "oauth2"],
  "generate_embeddings": true,
  "auto_link_work_items": true
}
```

**Response (201 Created):**
```json
{
  "id": "doc-001",
  "title": "API Authentication Guide",
  "slug": "api-authentication-guide",
  "content": "# API Authentication Guide\n\n## Overview\n\nThis guide covers authentication implementation...",
  "category": "API",
  "tags": ["authentication", "security", "jwt", "oauth2"],
  "created_by": {
    "user_id": "u001",
    "name": "Alex Chen"
  },
  "created_at": "2024-12-15T10:00:00Z",
  "version": 1,
  "embedding_job_id": "emb-job-001",
  "embedding_status": "processing",
  "message": "Documentation created successfully. Embeddings are being generated."
}
```

---

## 12. Update Documentation
**Jira Title:** API endpoint to update existing documentation  
**Summary:** Implement PATCH endpoint to update documentation content and regenerate embeddings if needed

**Endpoint:** `PATCH /api/v1/documentation/{document_id}`

**Request Body:**
```json
{
  "title": "API Authentication Guide (Updated)",
  "content": "# API Authentication Guide\n\n## Overview (Updated)\n\nThis comprehensive guide covers authentication implementation...",
  "tags": ["authentication", "security", "jwt", "oauth2", "best-practices"],
  "regenerate_embeddings": true
}
```

**Response (200 OK):**
```json
{
  "id": "doc-001",
  "title": "API Authentication Guide (Updated)",
  "updated": true,
  "version": 4,
  "updated_at": "2024-12-21T14:30:00Z",
  "updated_by": {
    "user_id": "u001",
    "name": "Alex Chen"
  },
  "embedding_job_id": "emb-job-015",
  "embedding_status": "processing",
  "message": "Documentation updated successfully. Embeddings are being regenerated."
}
```

---

## 13. Delete Documentation
**Jira Title:** API endpoint to delete documentation entry  
**Summary:** Implement DELETE endpoint to remove documentation and associated embeddings

**Endpoint:** `DELETE /api/v1/documentation/{document_id}`

**Request Body (Optional):**
```json
{
  "archive_instead": false,
  "delete_embeddings": true
}
```

**Response (200 OK):**
```json
{
  "id": "doc-001",
  "deleted": true,
  "embeddings_deleted": true,
  "deleted_at": "2024-12-21T15:00:00Z",
  "message": "Documentation deleted successfully"
}
```

---

## 14. Generate Embeddings for Documentation
**Jira Title:** API endpoint to generate or regenerate vector embeddings for RAG  
**Summary:** Implement POST endpoint to create vector embeddings for documentation content to enable semantic search

**Endpoint:** `POST /api/v1/documentation/{document_id}/embeddings`

**Request Body:**
```json
{
  "chunk_size": 512,
  "chunk_overlap": 50,
  "embedding_model": "text-embedding-ada-002",
  "force_regenerate": false
}
```

**Response (202 Accepted):**
```json
{
  "job_id": "emb-job-020",
  "document_id": "doc-001",
  "status": "processing",
  "estimated_completion": "2024-12-21T15:05:00Z",
  "message": "Embedding generation started",
  "poll_url": "/api/v1/documentation/embeddings/jobs/emb-job-020"
}
```

**Poll Status Response (200 OK):**
```json
{
  "job_id": "emb-job-020",
  "document_id": "doc-001",
  "status": "completed",
  "chunks_created": 15,
  "embedding_count": 15,
  "completed_at": "2024-12-21T15:03:12Z",
  "metadata": {
    "model": "text-embedding-ada-002",
    "dimensions": 1536,
    "total_tokens": 1847
  }
}
```

---

## 15. Search Documentation (RAG)
**Jira Title:** API endpoint for semantic search using RAG embeddings  
**Summary:** Implement POST endpoint to perform semantic search across documentation using vector similarity

**Endpoint:** `POST /api/v1/documentation/search`

**Request Body:**
```json
{
  "query": "How do I implement JWT token refresh in the authentication flow?",
  "search_type": "semantic",
  "filters": {
    "category": ["API", "Security"],
    "tags": ["authentication", "jwt"]
  },
  "limit": 10,
  "similarity_threshold": 0.7,
  "include_context": true
}
```

**Response (200 OK):**
```json
{
  "query": "How do I implement JWT token refresh in the authentication flow?",
  "results": [
    {
      "document_id": "doc-001",
      "title": "API Authentication Guide",
      "chunk_id": "chunk-001-05",
      "content": "## Token Refresh Mechanism\n\nTo implement JWT token refresh, follow these steps:\n\n1. Store refresh tokens securely in httpOnly cookies\n2. Implement a refresh endpoint at `/auth/refresh`\n3. Validate the refresh token and issue new access token\n4. Set appropriate expiration times (access: 15min, refresh: 7 days)",
      "similarity_score": 0.94,
      "metadata": {
        "section": "Token Refresh Mechanism",
        "category": "API",
        "created_at": "2024-12-15T10:00:00Z"
      }
    },
    {
      "document_id": "doc-023",
      "title": "JWT Token Management",
      "chunk_id": "chunk-023-03",
      "content": "### Best Practices for Token Refresh\n\nWhen implementing token refresh:\n- Use sliding window refresh (extend expiration on use)\n- Implement token rotation for security\n- Handle concurrent refresh requests with locking\n- Provide clear error messages for expired tokens",
      "similarity_score": 0.89,
      "metadata": {
        "section": "Best Practices for Token Refresh",
        "category": "API",
        "created_at": "2024-11-28T14:00:00Z"
      }
    },
    {
      "document_id": "doc-015",
      "title": "OAuth2 Implementation Details",
      "chunk_id": "chunk-015-08",
      "content": "## Refresh Token Flow\n\nThe OAuth2 refresh token flow allows clients to obtain new access tokens without requiring user interaction. The flow involves:\n\n1. Client sends refresh token to authorization server\n2. Server validates refresh token\n3. Server issues new access token (and optionally new refresh token)\n4. Client uses new access token for API requests",
      "similarity_score": 0.85,
      "metadata": {
        "section": "Refresh Token Flow",
        "category": "API",
        "created_at": "2024-12-01T09:30:00Z"
      }
    }
  ],
  "total_results": 8,
  "search_time_ms": 142
}
```

---

## 16. AI-Assisted Documentation Generation
**Jira Title:** API endpoint for AI-powered documentation generation from code/tickets  
**Summary:** Implement POST endpoint to generate documentation using LLM with RAG context from existing docs

**Endpoint:** `POST /api/v1/documentation/ai-generate`

**Request Body:**
```json
{
  "prompt": "Generate documentation for the new rate limiting middleware implementation in the API service",
  "context_sources": {
    "code_repositories": ["api-service"],
    "work_items": ["ABC-156"],
    "related_docs": ["doc-001", "doc-008"]
  },
  "documentation_type": "technical_guide",
  "audience": "engineers",
  "include_code_examples": true,
  "tone": "formal",
  "max_length": 2000
}
```

**Response (202 Accepted):**
```json
{
  "job_id": "ai-gen-job-005",
  "status": "processing",
  "estimated_completion": "2024-12-21T15:10:00Z",
  "message": "AI documentation generation started. Analyzing context and generating content...",
  "poll_url": "/api/v1/documentation/ai-generate/jobs/ai-gen-job-005"
}
```

**Poll Status Response (200 OK):**
```json
{
  "job_id": "ai-gen-job-005",
  "status": "completed",
  "completed_at": "2024-12-21T15:08:23Z",
  "generated_documentation": {
    "title": "Rate Limiting Middleware Implementation Guide",
    "content": "# Rate Limiting Middleware Implementation Guide\n\n## Overview\n\nThis guide covers the implementation of the new rate limiting middleware for the API service...\n\n## Architecture\n\nThe rate limiting middleware uses Redis for distributed rate tracking...\n\n## Implementation\n\n```javascript\nconst rateLimiter = new RateLimiter({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100 // limit each IP to 100 requests per windowMs\n});\n```\n\n## Configuration\n\n...",
    "suggested_tags": ["rate-limiting", "middleware", "api", "redis"],
    "suggested_category": "API",
    "word_count": 847,
    "context_used": [
      {
        "source": "doc-001",
        "title": "API Authentication Guide",
        "relevance": 0.76
      },
      {
        "source": "ABC-156",
        "title": "Implement rate limiting for API endpoints",
        "relevance": 0.92
      }
    ]
  },
  "metadata": {
    "model": "gpt-4",
    "total_tokens": 2456,
    "completion_tokens": 1234,
    "prompt_tokens": 1222
  }
}

  "share_id": "share-001",
  "share_url": "https://app.example.com/shared/retrospectives/abc123def456",
  "access_token": "abc123def456",
  "access_level": "read_only",
  "created_at": "2024-12-21T14:30:00Z",
  "expires_at": "2025-01-20T14:30:00Z",
  "view_count": 0,
  "last_accessed": null
}
```

