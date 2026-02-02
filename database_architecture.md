## Database Architecture Overview

This schema separates **operational data**, **evidence**, **knowledge**, and **retrieval** into clear layers that feed a single vector store used for AI reasoning.

### 1) Operational Layer (source of truth)

Captures the day-to-day system of work and people.

* Users, teams, memberships
* Work items, links, triage, daily updates
* Standups and review sessions
* Chat conversations and messages

This layer models **who did what, when, and why**.

### 2) Evidence Layer (what actually happened)

Attaches objective proof to work.

* Branches, PRs, commits, diffs, comments
* Mappings from work items to code artifacts

This prevents retrospectives and summaries from relying on self-reporting alone.

### 3) Knowledge Layer (documents and versions)

Stores durable knowledge used for reference and retrieval.

* Documents, versions, metrics
* Links between documents and work

This becomes long-lived context for both humans and AI.

### 4) Retrospective & Narrative Layer

Structured summaries generated from the operational and evidence layers.

* Retrospectives
* Team sections, approvals, comments
* Export and sharing state

This is where system activity becomes readable narrative.

### 5) RAG / Embedding Layer (AI retrieval core)

All content from the previous layers is normalized into retrieval windows and chunks.

* `rag_units` define logical retrieval windows (thread, doc section, review window, etc.)
* `rag_chunks` store the actual embeddings and power semantic search
* Embedding configs and jobs control how content becomes vectors

**`rag_chunks` is the canonical vector store.**
All AI similarity search runs exclusively against this table.

### Design Principle

Everything in the system — tickets, code, docs, chat, reviews, retros — is:

1. Stored in its native relational form
2. Windowed into retrieval units
3. Chunked and embedded into `rag_chunks`

This allows:

* Human workflows to operate normally in relational tables
* AI workflows to operate purely against a unified vector space
* Full traceability from any AI answer back to original source records


```
-- =========================
-- Tenancy & Embedding Core
-- =========================

-- Tenants in the system (org / customer boundary)
CREATE TABLE tenants (
  tenant_id uuid PRIMARY KEY,
  name text,
  created_at timestamptz
);

-- Available embedding models and their vector dimensions
CREATE TABLE embedding_models (
  model_id uuid PRIMARY KEY,
  name text,
  dimensions int,
  created_at timestamptz
);

-- Per-tenant configuration controlling how text is chunked and embedded
CREATE TABLE tenant_embedding_config (
  tenant_id uuid PRIMARY KEY REFERENCES tenants,
  model_id uuid REFERENCES embedding_models,
  chunk_target_tokens int,
  chunk_min_tokens int,
  chunk_max_tokens int,
  overlap_tokens int,
  updated_at timestamptz
);

-- =========================
-- Identity & Teams
-- =========================

-- Users known to the system across tools (Jira, Git, Chat, etc.)
CREATE TABLE users (
  user_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  external_id text,
  username text,
  display_name text,
  email text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Logical teams used for grouping work, retros, standups, and RAG filtering
CREATE TABLE teams (
  team_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  team_key text,
  name text,
  created_at timestamptz
);

-- Membership of users inside teams over time
CREATE TABLE team_members (
  tenant_id uuid REFERENCES tenants,
  team_id uuid REFERENCES teams,
  user_id uuid REFERENCES users,
  role text,
  joined_at timestamptz,
  left_at timestamptz
);

-- =========================
-- Work Items
-- =========================

-- Normalized representation of tickets/issues/tasks from external systems
CREATE TABLE work_items (
  work_item_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  key text,
  title text,
  intent text,
  description text,
  status text,
  status_category text,
  project_key text,
  team_key text,
  assignee_user_id uuid REFERENCES users,
  priority text,
  created_at timestamptz,
  updated_at timestamptz,
  closed_at timestamptz
);

-- Relationships between work items (parent/child/blocks/etc.)
CREATE TABLE work_item_links (
  tenant_id uuid REFERENCES tenants,
  src_key text,
  dst_key text,
  link_type text,
  created_at timestamptz
);

-- Daily triage decisions a user makes about their work items
CREATE TABLE work_item_triage (
  triage_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  work_item_key text,
  user_id uuid REFERENCES users,
  triage_status text,
  note text,
  triaged_at timestamptz
);

-- =========================
-- Work Review Loop
-- =========================

-- A single user’s daily review session
CREATE TABLE review_sessions (
  session_id text PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  user_id uuid REFERENCES users,
  session_date date,
  status text,
  total_items int,
  reviewed_count int,
  created_at timestamptz,
  completed_at timestamptz
);

-- The ordered set of work items presented during a review session
CREATE TABLE review_session_items (
  tenant_id uuid REFERENCES tenants,
  session_id text REFERENCES review_sessions,
  work_item_key text,
  source text,
  why_here text,
  has_changes bool,
  last_update_date date,
  position int,
  created_at timestamptz
);

-- The user’s answers during the review flow (daily updates)
CREATE TABLE review_responses (
  response_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  session_id text REFERENCES review_sessions,
  work_item_key text,
  question text,
  response text,
  answered_at timestamptz,
  created_at timestamptz
);

-- Structured daily updates derived from review responses
CREATE TABLE work_item_updates (
  update_id text PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  work_item_key text,
  user_id uuid REFERENCES users,
  update_type text,
  recent_changes text,
  next_focus text,
  needs_help bool,
  context text,
  occurred_at timestamptz,
  created_at timestamptz
);

-- =========================
-- Code Evidence
-- =========================

-- References to branches, PRs, commits, and repos tied to work
CREATE TABLE code_refs (
  code_ref_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  provider text,
  repo text,
  ref_type text,
  ref_id text,
  url text,
  last_activity_at timestamptz,
  metadata jsonb
);

-- Mapping of work items to their related code artifacts
CREATE TABLE work_item_code_refs (
  tenant_id uuid REFERENCES tenants,
  work_item_key text,
  code_ref_id uuid REFERENCES code_refs,
  link_type text,
  created_at timestamptz
);

-- AI or system summaries of diffs for later reasoning and retros
CREATE TABLE diff_summaries (
  diff_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  code_ref_id uuid REFERENCES code_refs,
  files_changed int,
  insertions int,
  deletions int,
  last_commit_at timestamptz,
  summary text,
  created_at timestamptz
);

-- Comments and reviews left on PRs as additional evidence
CREATE TABLE pr_comments (
  pr_comment_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  code_ref_id uuid REFERENCES code_refs,
  author_user_id uuid REFERENCES users,
  comment_type text,
  body text,
  created_at timestamptz
);

-- =========================
-- Standups
-- =========================

-- Daily standup entries per user
CREATE TABLE standup_entries (
  entry_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  team_key text,
  user_id uuid REFERENCES users,
  entry_date date,
  content text,
  created_at timestamptz
);

-- Work items referenced inside a standup entry
CREATE TABLE standup_entry_work_items (
  tenant_id uuid REFERENCES tenants,
  entry_id uuid REFERENCES standup_entries,
  work_item_key text,
  created_at timestamptz
);

-- =========================
-- Retrospectives
-- =========================

-- A generated retrospective covering a time window and scope
CREATE TABLE retrospectives (
  retrospective_id text PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  scope text,
  status text,
  date_start date,
  date_end date,
  preview text,
  created_by text,
  created_at timestamptz,
  last_updated timestamptz
);

-- High-level editable summary content for a retrospective
CREATE TABLE retrospective_summaries (
  retrospective_id text PRIMARY KEY REFERENCES retrospectives,
  tenant_id uuid REFERENCES tenants,
  executive_overview text,
  risks text[],
  cross_team_progress text[],
  raw_json jsonb,
  updated_by uuid REFERENCES users,
  updated_at timestamptz
);

-- Per-team breakdown of completed work, blockers, and decisions
CREATE TABLE retrospective_team_sections (
  section_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  retrospective_id text REFERENCES retrospectives,
  team_key text,
  completed text[],
  in_progress text[],
  blockers text[],
  decisions text[]
);

-- Team member approvals and commentary on a retrospective
CREATE TABLE retrospective_signoffs (
  signoff_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  retrospective_id text REFERENCES retrospectives,
  user_id uuid REFERENCES users,
  team_key text,
  approved bool,
  comment text,
  created_at timestamptz
);

-- Discussion thread attached to a retrospective
CREATE TABLE retrospective_comments (
  comment_id text PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  retrospective_id text REFERENCES retrospectives,
  user_id uuid REFERENCES users,
  author text,
  team_key text,
  content text,
  created_at timestamptz
);

-- =========================
-- Documents & Knowledge
-- =========================

-- Knowledge base documents used for RAG and reference
CREATE TABLE documents (
  document_id text PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  title text,
  slug text,
  category text,
  tags text[],
  current_version int,
  created_by uuid REFERENCES users,
  created_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  is_deleted bool
);

-- Version history of documents for traceability and re-embedding
CREATE TABLE document_versions (
  version_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  document_id text REFERENCES documents,
  version int,
  content text,
  updated_by uuid REFERENCES users,
  updated_at timestamptz,
  change_summary text,
  content_hash bytea
);

-- Links between documents and the work items they describe
CREATE TABLE document_work_item_links (
  tenant_id uuid REFERENCES tenants,
  document_id text REFERENCES documents,
  work_item_key text,
  link_reason text,
  created_at timestamptz
);

-- Lightweight usage metrics for documents
CREATE TABLE document_metrics (
  tenant_id uuid REFERENCES tenants,
  document_id text REFERENCES documents,
  view_count int,
  last_accessed timestamptz,
  updated_at timestamptz
);

-- =========================
-- Chat
-- =========================

-- Chat threads where AI assists users with context-aware reasoning
CREATE TABLE chat_conversations (
  conversation_id text PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  title text,
  context_type text,
  context_id text,
  created_by uuid REFERENCES users,
  created_at timestamptz,
  last_activity_at timestamptz,
  message_count int
);

-- Individual messages inside chat conversations
CREATE TABLE chat_messages (
  message_id text PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  conversation_id text REFERENCES chat_conversations,
  role text,
  content text,
  created_at timestamptz,
  metadata jsonb
);

-- =========================
-- RAG Layer
-- =========================

-- Logical retrieval windows grouping related content for embedding
CREATE TABLE rag_units (
  unit_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  source_type text,
  source_id text,
  parent_type text,
  parent_id text,
  window_kind text,
  window_index int,
  team_key text,
  category text,
  tags text[],
  visibility text,
  window_start_ts timestamptz,
  window_end_ts timestamptz,
  occurred_at timestamptz,
  token_count int,
  char_count int,
  content_hash bytea,
  source_version text,
  language text,
  embedding_status text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Individual embedded chunks that power semantic retrieval
CREATE TABLE rag_chunks (
  chunk_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  unit_id uuid REFERENCES rag_units,
  chunk_index int,
  chunk_text text,
  token_count int,
  char_count int,
  source_type text,
  source_id text,
  parent_type text,
  parent_id text,
  team_key text,
  category text,
  tags text[],
  visibility text,
  occurred_at timestamptz,
  section_path text,
  metadata jsonb,
  model_id uuid REFERENCES embedding_models,
  embedding vector,
  source_version text,
  chunk_hash bytea
);

-- Optional access control for retrieval units
CREATE TABLE rag_acl (
  tenant_id uuid REFERENCES tenants,
  principal_type text,
  principal_id text,
  unit_id uuid REFERENCES rag_units,
  can_read bool,
  created_at timestamptz
);

-- Background jobs that control chunking and embedding lifecycle
CREATE TABLE rag_index_jobs (
  job_id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  source_type text,
  source_id text,
  status text,
  config jsonb,
  error text,
  requested_by uuid,
  created_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz
);

-- Explicit embedding jobs for documents and re-embedding operations
CREATE TABLE embedding_jobs (
  job_id text PRIMARY KEY,
  tenant_id uuid REFERENCES tenants,
  job_type text,
  document_id text REFERENCES documents,
  status text,
  model_id uuid REFERENCES embedding_models,
  chunk_size int,
  chunk_overlap int,
  force_regenerate bool,
  chunks_created int,
  embedding_count int,
  total_tokens int,
  error text,
  created_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz
);

-- Fast lookup of a document’s current embedding state
CREATE TABLE document_embeddings_state (
  document_id text PRIMARY KEY REFERENCES documents,
  tenant_id uuid REFERENCES tenants,
  embedding_job_id text REFERENCES embedding_jobs,
  embedding_status text,
  last_embedded_at timestamptz
);
```