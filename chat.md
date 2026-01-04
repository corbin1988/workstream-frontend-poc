## LLM Context-Aware Chat Feature

### Purpose

Provide a single conversational interface that understands **live work**, **historical reviews**, and **documentation**, and can reason across them without flattening everything into summaries or metrics.

This is not a chatbot.
This is a query layer over real engineering artifacts.

---

## Core Capabilities

The chat operates over **three primary context domains**, simultaneously:

1. **Work State (Now)**
2. **Work Review (Past)**
3. **Documentation (Intent & Knowledge)**

The LLM never invents state. It only interprets indexed artifacts.

---

## Context Domains

### 1. Work State Context

Live, mutable data.

Includes:

* Tickets (status, priority, assignee, epic, project)
* Branches and PRs
* In-progress work review cards
* Blockers
* Daily reviews / standup entries
* Activity feed events

Example queries:

* “What is Jordan blocked on right now?”
* “Which API tickets are in progress and have open PRs?”
* “What work is at risk this week?”

---

### 2. Work Review Context

Frozen, time-bounded snapshots.

Includes:

* Generated work review summaries
* Team summaries
* Decisions made
* Evidence (PR counts, tickets closed, linked work)
* Comments and sign-offs
* Previous summaries in the archive

Example queries:

* “What decisions did we make last review that affect auth?”
* “Why did the OAuth timeline slip in December?”
* “What blockers keep recurring across reviews?”

---

### 3. Documentation Context

Markdown-based, versioned knowledge.

Includes:

* Architecture docs
* API documentation
* ADRs
* Operational guides
* Configuration references

The LLM reads documentation as **authoritative intent**, not historical record.

Example queries:

* “What does the authentication architecture look like?”
* “Is there documentation explaining why JWT was chosen?”
* “Where should I change rate limiting behavior?”

---

## Context Resolution Rules

When answering a question, the LLM:

1. **Detects intent**

   * Status
   * Explanation
   * Decision history
   * How-to
   * Risk / impact

2. **Selects sources**

   * Live work → tickets / PRs
   * Historical reasoning → work reviews
   * System truth → documentation

3. **Cross-links**

   * References tickets by ID
   * References documents by title/path
   * References reviews by date range

No single-source answers for multi-context questions.

---

## Example Blended Queries

* “Are we violating our documented auth design in current work?”
* “Which teams are working on things not covered by documentation?”
* “What undocumented decisions showed up in the last two reviews?”
* “Show me active work related to API rate limiting and the docs that govern it.”

---

## Chat UI Behavior

### Entry Points

* Global “New Chat”
* Contextual chat from:

  * Work Review
  * Ticket
  * Document
  * Project

Contextual chats pre-seed scope but remain expandable.

---

### Suggested Prompts

Generated dynamically based on visible context:

* “What tasks are currently in progress?”
* “Summarize recent team activity”
* “What documentation exists for X?”
* “What decisions led to this implementation?”

---

## Answer Structure (UI, not text format)

Responses may include:

* Natural language explanation
* Inline references (tickets, docs, reviews)
* Expandable evidence sections
* Follow-up suggestions

Example:

* Explanation
* “Referenced work” (clickable)
* “Relevant documentation”
* “Related decisions”

---

## Guardrails

* No speculative answers
* No hallucinated tickets or docs
* Explicitly states when context is missing
* Distinguishes:

  * Documented intent
  * Observed behavior
  * Historical decisions

---

## LLM-Assisted Actions (Optional)

From chat, users can:

* Generate a draft document
* Propose a work review summary
* Flag undocumented work
* Suggest ADR creation
* Link work to missing documentation

All actions require explicit confirmation.

---

## Mental Model

This chat answers:

* What is happening?
* Why is it happening?
* What did we agree to before?
* Where is the source of truth?
* What breaks if this changes?