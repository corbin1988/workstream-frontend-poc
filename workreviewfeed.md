## Work Review

The Work Review feature is the system’s primary mechanism for keeping project state accurate without meetings, reporting, or metrics.

It is built around a single idea:

**If each active unit of work is accurate once per day, the overall picture is accurate.**

Everything else in the system depends on this.

---

## What Work Review Is

Work Review is a **daily, contributor-driven confirmation loop** over in-progress work.

Once per day, each individual contributor is asked to review the items the system believes they are actively working on. The system presents its current understanding. The human corrects it only if needed.

Silence means agreement.

This replaces:

* Daily standups
* Status meetings
* “Any updates?” messages
* Manual Jira grooming for visibility

It does not replace technical discussion or decision-making.

---

## How Work Review Works

1. The system gathers all work marked *In Progress* and associated with the contributor.
2. It correlates tickets, branches, pull requests, comments, and recent activity.
3. It generates a daily snapshot of “active work.”
4. The contributor reviews and optionally annotates that snapshot.
5. The system updates its internal model of reality.

No broadcasting. No metrics. No scoring.

---

## Work Review Feed

The Work Review feed displays **work cards**, one per active unit of work.

Each card answers three questions:

* What is this work?
* Why does it exist?
* What is happening to it right now?

These cards are reused everywhere:

* Daily review
* Activity feed
* AI summaries
* Stakeholder retrospectives

---

## What a Work Review Card Contains

### 1. Identity & Intent

* **Ticket key and epic**
  Anchors the work to a larger objective or vertical slice.

* **Short intent summary**
  A stable, one-line statement of why the work exists.

* **Frozen description**
  The original problem statement with a timestamp showing when intent last changed. This prevents silent scope drift.

Purpose:
Preserves original intent so progress is judged against the goal, not shifting narratives.

---

### 2. Ownership & Context

* **Project**
  The system boundary the work belongs to.

* **Team**
  The group accountable for moving it forward.

* **Status**
  Coarse-grained only (In Progress, Blocked, Done).

* **Assignee**
  The person currently responsible for next action. This is ownership, not evaluation.

Purpose:
Makes responsibility explicit without introducing workflow bureaucracy.

---

### 3. Code Reality (Evidence)

* **Active branch**
  Shows where work is actually happening.

* **Diff summary**
  Files changed, insertions, deletions, and last commit time.

* **Pull request**
  PR number, state, last activity time.

* **PR comments**
  Review and resolution comments shown inline, labeled by type.

Purpose:
Ground the card in observable engineering work instead of self-reported status.

---

### 4. Dependencies & Constraints

* **Linked tickets**
  Parent relationships and blocking relationships.

Purpose:
Surface dependency risk without meetings or coordination overhead.

---

### 5. Daily Review Annotation (Human Context)

Updated during the daily review.

* **Recent changes**
  What materially changed since the last review. Often inferred automatically.

* **Next focus**
  Short-horizon intent, not a plan.

* **Needs help**
  Explicit signal that progress depends on something external.

* **Context**
  Free-form explanation when reality is messy or non-obvious.

Purpose:
Allows humans to add judgment and nuance where automation falls short.

---

### 6. History & Freshness

* **Previous updates**
  Collapsed history of earlier daily annotations.

* **Last updated timestamp**
  Shows how current the card is.

Purpose:
Makes drift visible without alerts or enforcement.

---

## What Work Review Does Not Track

* Time spent
* Estimates
* Percent complete
* Velocity
* Individual performance metrics

These are intentionally excluded. They distort behavior and reduce signal quality.

---

## Why This Works

* The system explains what it sees.
* Humans correct it when wrong.
* Accuracy compounds daily.
* Context beats metrics.
* Artifacts beat narratives.

If Work Review cards are accurate, everything built on top of them is accurate:

* Activity feeds
* AI summaries
* Retrospectives
* Stakeholder updates

Work Review is the foundation.
