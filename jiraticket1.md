# Jira Tickets for Work Review Dashboard API

## Ticket 1: API endpoint to fetch work items feed with filters

**Description:**
Implement GET endpoint to retrieve paginated work items with team filtering support.

Endpoint: `GET /api/v1/work-items`

Full endpoint specification available in [api.md](../../api.md#1-get-work-itemstickets-feed)

---

## Ticket 2: API endpoint to retrieve teams with work item counts

**Description:**
Implement GET endpoint to fetch all teams with their current work item counts for filtering.

Endpoint: `GET /api/v1/teams`

Full endpoint specification available in [api.md](../../api.md#2-get-teams-list)

---

## Ticket 3: API endpoint for work item search functionality

**Description:**
Implement GET endpoint for full-text search across work items, assignees, and descriptions.

Endpoint: `GET /api/v1/work-items/search`

Full endpoint specification available in [api.md](../../api.md#3-search-work-items)

---

## Ticket 4: API endpoint for user leaderboard and follow suggestions

**Description:**
Implement GET endpoint to retrieve top contributors and follow suggestions based on activity.

Endpoint: `GET /api/v1/users/leaderboard`

Full endpoint specification available in [api.md](../../api.md#4-get-leaderboarduser-recommendations)

---

## Ticket 5: API endpoint for user follow/unfollow actions

**Description:**
Implement POST endpoint to follow or unfollow users for personalized feed.

Endpoint: `POST /api/v1/users/{user_id}/follow`

Full endpoint specification available in [api.md](../../api.md#5-followunfollow-user)

---

## Ticket 6: API endpoint to retrieve standup entries for work items

**Description:**
Implement GET endpoint to fetch daily standup updates linked to work items.

Endpoint: `GET /api/v1/standup-entries`

Full endpoint specification available in [api.md](../../api.md#6-get-standup-entries)

---

## Ticket 7: API endpoint to retrieve selected work items for review session

**Description:**
Implement GET endpoint to fetch work items selected for daily review with their current status and context.

Endpoint: `GET /api/v1/review-sessions/current`

Full endpoint specification available in [api.md](../../api.md#7-get-work-items-for-review)

---

## Ticket 8: API endpoint to save user responses during review session

**Description:**
Implement POST endpoint to capture and save user updates for each work item during the review session.

Endpoint: `POST /api/v1/review-sessions/{session_id}/responses`

Full endpoint specification available in [api.md](../../api.md#8-update-work-item-review-response)

---

## Ticket 9: API endpoint to finalize and submit review session

**Description:**
Implement POST endpoint to mark review session as complete and process all collected updates.

Endpoint: `POST /api/v1/review-sessions/{session_id}/complete`

Full endpoint specification available in [api.md](../../api.md#9-complete-review-session)

---

## Ticket 10: API endpoint to fetch categorized work items for review drawer

**Description:**
Implement GET endpoint to retrieve work items organized by categories (continue from yesterday, active, suggested).

Endpoint: `GET /api/v1/review/work-items`

Full endpoint specification available in [api.md](../../api.md#10-get-work-items-for-daily-review-drawer)

---

## Ticket 11: API endpoint to update work item triage decisions

**Description:**
Implement PATCH endpoint to save user's triage decisions (keep/done/blocked/notmine) and notes for work items.

Endpoint: `PATCH /api/v1/work-items/{work_item_key}/triage`

Full endpoint specification available in [api.md](../../api.md#11-update-work-item-triage-status)

---

## Ticket 12: API endpoint to add work items to active review session

**Description:**
Implement POST endpoint to dynamically add work items to the current review session from search results.

Endpoint: `POST /api/v1/review-sessions/current/items`

Full endpoint specification available in [api.md](../../api.md#12-add-work-item-to-review-session)

---

## Ticket 13: Webhook endpoint to receive and process Git/Bitbucket events

**Description:**
Implement POST endpoint to receive webhook events from Git providers (GitHub, Bitbucket, GitLab) and process them into activity feed.

Endpoint: `POST /api/v1/webhooks/git`

Full endpoint specification available in [api.md](../../api.md#13-webhook-receiver-for-git-events)

---

## Ticket 14: API endpoint to retrieve git activity feed with team filtering

**Description:**
Implement GET endpoint to fetch processed git activities from webhooks with pagination and filtering.

Endpoint: `GET /api/v1/activities`

Full endpoint specification available in [api.md](../../api.md#14-get-activity-feed)

---

## Ticket 15: API endpoint to retrieve detailed information for activity event

**Description:**
Implement GET endpoint to fetch full details of a specific activity event including all metadata.

Endpoint: `GET /api/v1/activities/{event_id}`

Full endpoint specification available in [api.md](../../api.md#15-get-activity-event-details)

---

## Ticket 16: API endpoint to retrieve paginated retrospective summaries

**Description:**
Implement GET endpoint to fetch list of retrospective summaries with filtering and pagination support.

Endpoint: `GET /api/v1/retrospectives`

Full endpoint specification available in [retro_api.md](../../retro_api.md#1-get-retrospective-summaries-list)

---

## Ticket 17: API endpoint to retrieve detailed retrospective summary

**Description:**
Implement GET endpoint to fetch complete retrospective including executive overview, team summaries, risks, sign-offs, and comments.

Endpoint: `GET /api/v1/retrospectives/{retrospective_id}`

Full endpoint specification available in [retro_api.md](../../retro_api.md#2-get-retrospective-summary-details)

---

## Ticket 18: API endpoint to generate AI-powered retrospective summary

**Description:**
Implement POST endpoint to trigger AI generation of retrospective summary from work artifacts with configurable parameters.

Endpoint: `POST /api/v1/retrospectives/generate`

Full endpoint specification available in [retro_api.md](../../retro_api.md#3-generate-retrospective-summary)

---

## Ticket 19: API endpoint to update retrospective summary content

**Description:**
Implement PATCH endpoint to allow editing of retrospective summary sections before final approval.

Endpoint: `PATCH /api/v1/retrospectives/{retrospective_id}`

Full endpoint specification available in [retro_api.md](../../retro_api.md#4-update-retrospective-summary)

---

## Ticket 20: API endpoint to submit sign-off approval for retrospective

**Description:**
Implement POST endpoint to allow team members to approve or reject retrospective summary with optional comments.

Endpoint: `POST /api/v1/retrospectives/{retrospective_id}/sign-offs`

Full endpoint specification available in [retro_api.md](../../retro_api.md#5-add-sign-off-approval)

---

## Ticket 21: API endpoint to add comments to retrospective summary

**Description:**
Implement POST endpoint to allow team members to add discussion comments to retrospective.

Endpoint: `POST /api/v1/retrospectives/{retrospective_id}/comments`

Full endpoint specification available in [retro_api.md](../../retro_api.md#6-add-comment-to-retrospective)

---

## Ticket 22: API endpoint to export retrospective summary as PDF

**Description:**
Implement POST endpoint to generate PDF export of retrospective summary for distribution.

Endpoint: `POST /api/v1/retrospectives/{retrospective_id}/export/pdf`

Full endpoint specification available in [retro_api.md](../../retro_api.md#7-export-retrospective-as-pdf)

---

## Ticket 23: API endpoint to create shareable read-only link for retrospective

**Description:**
Implement POST endpoint to generate secure, time-limited read-only links for external stakeholders.

Endpoint: `POST /api/v1/retrospectives/{retrospective_id}/share`

Full endpoint specification available in [retro_api.md](../../retro_api.md#8-generate-share-link)

---

## Ticket 24: API endpoint to retrieve paginated documentation entries

**Description:**
Implement GET endpoint to fetch list of documentation with filtering, search, and pagination support.

Endpoint: `GET /api/v1/documentation`

Full endpoint specification available in [retro_api.md](../../retro_api.md#9-get-documentation-list)

---

## Ticket 25: API endpoint to retrieve single documentation entry with full content

**Description:**
Implement GET endpoint to fetch complete documentation including markdown content and metadata.

Endpoint: `GET /api/v1/documentation/{document_id}`

Full endpoint specification available in [retro_api.md](../../retro_api.md#10-get-documentation-by-id)

---

## Ticket 26: API endpoint to create new documentation entry

**Description:**
Implement POST endpoint to create new documentation with automatic embedding generation.

Endpoint: `POST /api/v1/documentation`

Full endpoint specification available in [retro_api.md](../../retro_api.md#11-create-documentation)

---

## Ticket 27: API endpoint to update existing documentation

**Description:**
Implement PATCH endpoint to update documentation content and regenerate embeddings if needed.

Endpoint: `PATCH /api/v1/documentation/{document_id}`

Full endpoint specification available in [retro_api.md](../../retro_api.md#12-update-documentation)

---

## Ticket 28: API endpoint to delete documentation entry

**Description:**
Implement DELETE endpoint to remove documentation and associated embeddings.

Endpoint: `DELETE /api/v1/documentation/{document_id}`

Full endpoint specification available in [retro_api.md](../../retro_api.md#13-delete-documentation)

---

## Ticket 29: API endpoint to generate or regenerate vector embeddings for RAG

**Description:**
Implement POST endpoint to create vector embeddings for documentation content to enable semantic search.

Endpoint: `POST /api/v1/documentation/{document_id}/embeddings`

Full endpoint specification available in [retro_api.md](../../retro_api.md#14-generate-embeddings-for-documentation)

---

## Ticket 30: API endpoint for semantic search using RAG embeddings

**Description:**
Implement POST endpoint to perform semantic search across documentation using vector similarity.

Endpoint: `POST /api/v1/documentation/search`

Full endpoint specification available in [retro_api.md](../../retro_api.md#15-search-documentation-rag)

---

## Ticket 31: API endpoint for AI-powered documentation generation from code/tickets

**Description:**
Implement POST endpoint to generate documentation using LLM with RAG context from existing docs.

Endpoint: `POST /api/v1/documentation/ai-generate`

Full endpoint specification available in [retro_api.md](../../retro_api.md#16-ai-assisted-documentation-generation)

---

## Ticket 32: API endpoint to send chat message and receive AI response

**Description:**
Implement POST endpoint to send user message with optional context scope and receive AI-generated response with references to work items, reviews, and documentation.

Endpoint: `POST /api/v1/chat/messages`

Full endpoint specification available in [chat_api.md](../../chat_api.md#1-send-chat-message)

---

## Ticket 33: API endpoint to retrieve contextual suggested prompts

**Description:**
Implement GET endpoint to fetch dynamically generated suggested prompts based on current workspace context, user activity, and recent work.

Endpoint: `GET /api/v1/chat/suggested-prompts`

Full endpoint specification available in [chat_api.md](../../chat_api.md#2-get-suggested-prompts)

---

## Ticket 34: API endpoint to create new chat conversation

**Description:**
Implement POST endpoint to start a new chat conversation with optional initial context seeding.

Endpoint: `POST /api/v1/chat/conversations`

Full endpoint specification available in [chat_api.md](../../chat_api.md#3-create-chat-conversation)

---

## Ticket 35: API endpoint to retrieve all chat conversations

**Description:**
Implement GET endpoint to fetch paginated list of all user conversations with metadata and recent activity.

Endpoint: `GET /api/v1/chat/conversations`

Full endpoint specification available in [chat_api.md](../../chat_api.md#4-get-all-conversations)

---

## Ticket 36: API endpoint to retrieve chat conversation history

**Description:**
Implement GET endpoint to fetch conversation details and full message history with references.

Endpoint: `GET /api/v1/chat/conversations/{conversation_id}`

Full endpoint specification available in [chat_api.md](../../chat_api.md#5-get-chat-conversation)

---

## Ticket 37: API endpoint to retrieve available context sources for chat

**Description:**
Implement GET endpoint to fetch summary of available context data (work items, reviews, documentation) that can be queried.

Endpoint: `GET /api/v1/chat/context`

Full endpoint specification available in [chat_api.md](../../chat_api.md#6-get-available-context-sources)

---

## Ticket 38: API endpoint for streaming chat responses

**Description:**
Implement Server-Sent Events (SSE) endpoint to stream AI responses in real-time for improved user experience.

Endpoint: `POST /api/v1/chat/messages/stream`

Full endpoint specification available in [chat_api.md](../../chat_api.md#7-stream-chat-response)
