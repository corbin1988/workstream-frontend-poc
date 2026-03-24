# Phase 1 — Backend Schema & API Changes

## Context

The goal of Phase 1 was to establish the data model and API endpoints needed to:
1. Support project-level and tenant-level task questions (Option B split)
2. Persist work item snapshots so Feed5 can render past updates without hitting Jira
3. Persist review session answers per work item with a completeness flag

Phase 2 (frontend wiring) connects `dailybuilder2 → WorkDrawer4 → workreview` to these endpoints and replaces mock data in `Feed5.tsx` with real `WorkItemUpdate` history.

---

## Design Decisions

### Option B: Split question ownership
- `WorkItemMapping.task_questions` → **project-scoped** questions only
- `TenantConfig.task_questions` → **tenant-scoped** questions shared across all projects
- `scope` field removed from `WorkItemMapping.task_questions` (it is implicit — everything there is project-level)
- At review time `workreview.tsx` merges both lists: tenant questions first, then project questions

### All questions are required
- `is_complete = answers.every(a => a.answer.trim() !== '')`
- Zero questions configured → `is_complete = true` by default
- Enforced in both the backend controller and (Phase 2) the frontend "Next" button gate

### Question text is snapshotted in answers
- `WorkItemUpdate.answers[].question_text` stores the text at save time
- Editing a question later does not corrupt historical review records

### WorkItem snapshot
- Stored when a review session is submitted (not when the item is selected in WorkDrawer4)
- Allows Feed5 to render the previous updates panel without a live Jira call

---

## Files Changed

### Modified

#### `workstream_express/src/models/WorkItemMapping.ts`
- Removed `scope: "project" | "tenant"` from the `task_questions` subdocument in both the TypeScript interface and the Mongoose schema
- All questions stored here are now implicitly project-scoped

---

#### `workstream_express/src/server.ts`
Added two new imports and two new `app.use` registrations:

```ts
import tenantConfigRoutes from './routes/tenantConfigRoutes';
import workItemRoutes from './routes/workItemRoutes';

app.use('/api/tenant-config', tenantConfigRoutes);
app.use('/api/work-items', workItemRoutes);
```

---

### New Files

#### `workstream_express/src/models/TenantConfig.ts`
One document per tenant. Holds tenant-wide task questions.

```ts
{
  tenant_id: bigint          // unique index
  task_questions: { id, text }[]
  created_at, updated_at
}
```

---

#### `workstream_express/src/models/WorkItem.ts`
Snapshot of a Jira issue at the time a review is submitted. Unique per `{ tenant_id, provider, project_key, issue_key }`.

```ts
{
  tenant_id: bigint
  provider: string           // default: 'jira'
  project_key: string
  issue_key: string          // e.g. 'ABC-123'
  jira_issue_id: string
  title: string
  description: string
  assignee: string
  status_category: string
  priority: string
  due_date: string
  intent_frozen_at: Date | null
  created_at, updated_at
}
```

---

#### `workstream_express/src/models/WorkItemUpdate.ts`
One document per review session per work item per day. Unique per `{ tenant_id, issue_key, review_date }`.

```ts
{
  tenant_id: bigint
  issue_key: string
  project_key: string
  review_date: Date
  answers: [
    {
      question_id: string
      question_text: string  // snapshot of text at save time
      answer: string
      scope: 'project' | 'tenant'
    }
  ]
  is_complete: boolean       // true when all answers are non-empty
  created_at, updated_at
}
```

---

#### `workstream_express/src/controllers/tenantConfigController.ts`
| Handler | Method | Path |
|---|---|---|
| `getTenantConfigHandler` | `GET` | `/api/tenant-config` |
| `upsertTenantConfigHandler` | `PUT` | `/api/tenant-config` |

---

#### `workstream_express/src/controllers/workItemController.ts`
| Handler | Method | Path |
|---|---|---|
| `getWorkItemHandler` | `GET` | `/api/work-items/:issueKey?provider=&projectKey=` |
| `upsertWorkItemHandler` | `POST` | `/api/work-items` |
| `listWorkItemUpdatesHandler` | `GET` | `/api/work-items/:issueKey/updates?projectKey=` |
| `createWorkItemUpdateHandler` | `POST` | `/api/work-items/:issueKey/updates` |

**`createWorkItemUpdateHandler` validation logic:**
1. Fetches `TenantConfig` and `WorkItemMapping` in parallel
2. Merges questions: tenant questions first, then project questions
3. Builds `resolvedAnswers` by matching submitted `answers[].question_id` to the merged list
4. Sets `is_complete = allQuestions.every(q => answer is non-empty)`
5. Upserts on `{ tenant_id, issue_key, review_date }` — one record per item per day

---

#### `workstream_express/src/routes/tenantConfigRoutes.ts`
```
GET  /api/tenant-config
PUT  /api/tenant-config
```

---

#### `workstream_express/src/routes/workItemRoutes.ts`
```
GET  /api/work-items/:issueKey
POST /api/work-items
GET  /api/work-items/:issueKey/updates
POST /api/work-items/:issueKey/updates
```

---

## API Reference

### `GET /api/tenant-config`
Returns the tenant's shared questions. Returns `{ task_questions: [] }` if none exist yet.

```json
{
  "config": {
    "task_questions": [
      { "id": "q_tenant_1", "text": "Any blockers to flag?" }
    ]
  }
}
```

### `PUT /api/tenant-config`
Body: `{ "task_questions": [{ "id": "...", "text": "..." }] }`

---

### `POST /api/work-items`
Upsert a work item snapshot. Called when a review session starts.

Body:
```json
{
  "provider": "jira",
  "project_key": "ABC",
  "issue_key": "ABC-123",
  "jira_issue_id": "10042",
  "title": "Add authentication endpoint",
  "description": "...",
  "assignee": "Jane Doe",
  "status_category": "In Progress",
  "priority": "High",
  "due_date": "2026-04-01",
  "intent_frozen_at": "2026-03-22T10:00:00Z"
}
```

---

### `POST /api/work-items/:issueKey/updates`
Save a review session. Backend merges questions from TenantConfig + WorkItemMapping and computes `is_complete`.

Body:
```json
{
  "provider": "jira",
  "project_key": "ABC",
  "review_date": "2026-03-22T00:00:00Z",
  "answers": [
    { "question_id": "q_tenant_1", "answer": "No blockers." },
    { "question_id": "q_yesterday", "answer": "Fixed the auth bug." }
  ]
}
```

Response:
```json
{ "ok": true, "is_complete": true, "id": "..." }
```

---

### `GET /api/work-items/:issueKey/updates?projectKey=ABC`
Returns review history sorted newest-first. Used by Feed5 "previous updates" panel.

```json
{
  "updates": [
    {
      "review_date": "2026-03-22T00:00:00Z",
      "is_complete": true,
      "answers": [
        { "question_id": "q_yesterday", "question_text": "What did you do since yesterday?", "answer": "Fixed the auth bug.", "scope": "project" }
      ]
    }
  ]
}
```

---

## Phase 2 TODOs (remaining)

- [ ] `Feed5.tsx` — replace `mockPreviousUpdates` with `GET /api/work-items/:issueKey/updates`
- [ ] `cardbuilder2.tsx` (Step 6) — remove `scope` toggle from task question editor UI (scope is no longer a field)
- [ ] Tenant ID hardcoded as `'1'` in all controllers — needs real auth middleware when multi-tenant is live

---

## Phase 2 — Frontend Changes

### Overview

Phase 2 wires `dailybuilder2 → WorkDrawer4 → workreview` to the Phase 1 API endpoints and replaces the hardcoded single-question UX with a dynamic multi-question flow per work item.

**Data flow:**
1. `dailybuilder2` fetches mappings (project questions) + tenant-config (tenant questions)
2. Passes both into `WorkDrawer4` via props
3. `WorkDrawer4.handleStartReview` merges questions per item, writes to `sessionStorage`, navigates to `/workreview`
4. `workreview` reads `sessionStorage` on mount, steps through each item question-by-question, POSTs snapshot + update on Finish

---

### Modified Files

#### `src/components/WorkDrawer4.tsx`

**Interface changes:**

`WorkItem` — added optional `projectKey`:
```ts
interface WorkItem {
  key: string;
  title: string;
  intent?: string;
  hasChanges?: boolean;
  whyHere?: string;
  triaged?: boolean;
  projectKey?: string;   // NEW — set when flattening project items
}
```

`ProjectItems` (exported) — added `task_questions`:
```ts
export interface ProjectItems {
  projectKey: string;
  projectName: string;
  activeInProgress: WorkItem[];
  suggested?: Array<WorkItem & { reason: string }>;
  task_questions: Array<{ id: string; text: string }>;  // NEW
}
```

`DrawerProps` — added `tenantQuestions`:
```ts
interface DrawerProps {
  ...
  tenantQuestions?: Array<{ id: string; text: string }>;  // NEW
}
```

**`allProjectActiveItems`** — now embeds `projectKey` on each item so `handleStartReview` can look up the right project:
```ts
const allProjectActiveItems = projects?.flatMap(p =>
  p.activeInProgress.map(item => ({ ...item, projectKey: p.projectKey }))
) ?? [];
```

**`handleStartReview`** (new function) — builds the session payload and navigates:
```ts
const handleStartReview = () => {
  const allItems = [...continueItems, ...activeItems];
  const selected = allItems.filter(item => {
    const status = workItems[item.key]?.status;
    return status !== 'done' && status !== 'notmine';
  });

  const sessionItems = selected.map(item => {
    const pk = item.projectKey ?? '';
    const project = projects?.find(p => p.projectKey === pk);
    const projectQs = (project?.task_questions ?? []).map(q => ({ ...q, scope: 'project' as const }));
    const tenantQs = tenantQuestions.map(q => ({ ...q, scope: 'tenant' as const }));
    return {
      key: item.key,
      title: item.title,
      intent: item.intent,
      projectKey: pk,
      status: workItems[item.key]?.status ?? '',
      questions: [...tenantQs, ...projectQs],  // tenant questions first
    };
  });

  sessionStorage.setItem('workstream_review_session', JSON.stringify({ items: sessionItems }));
  onClose();
  router.push('/workreview');
};
```

**Footer button** — replaced `<Link href="/workreview">` with a button that calls `handleStartReview`.

---

#### `src/pages/dailybuilder2.tsx`

**`DbMapping` interface** — added `task_questions`:
```ts
interface DbMapping {
  ...
  task_questions: Array<{ id: string; text: string }>;  // NEW
}
```

**State** — added `tenantQuestions`:
```ts
const [tenantQuestions, setTenantQuestions] = useState<Array<{ id: string; text: string }>>([]);
```

**`handleOpen`** — fetches `/api/tenant-config` after mappings fetch:
```ts
const tenantRes = await fetch(`${EXPRESS_URL}/api/tenant-config`);
const tenantData = tenantRes.ok ? await tenantRes.json() : { config: { task_questions: [] } };
setTenantQuestions(tenantData.config?.task_questions ?? []);
```

**Project result** — passes `task_questions` from mapping into each `ProjectItems` entry:
```ts
return {
  projectKey: mapping.project_key,
  projectName: mapping.project_name,
  activeInProgress,
  task_questions: mapping.task_questions ?? [],  // NEW
};
```

**`WorkDrawer4` render** — passes `tenantQuestions` prop:
```tsx
<WorkDrawer4
  isOpen={open}
  onClose={() => setOpen(false)}
  loading={loading}
  projects={projectItems}
  tenantQuestions={tenantQuestions}   // NEW
/>
```

---

#### `src/pages/workreview.tsx`

Complete rewrite. Previous version had a single hardcoded question; new version is a dynamic multi-question chat loop.

**Key interfaces:**
```ts
interface ReviewQuestion {
  id: string;
  text: string;
  scope: 'project' | 'tenant';
}

interface ReviewItem {
  key: string;
  title: string;
  intent?: string;
  projectKey: string;
  status: string;
  questions: ReviewQuestion[];
}

interface Message {
  role: 'system' | 'user';
  content: string;
}

interface ItemState {
  reviewed: boolean;
  messages: Message[];
  answers: Array<{ question_id: string; answer: string }>;
}
```

**`FALLBACK_QUESTION`** — used when a work item has zero configured questions:
```ts
const FALLBACK_QUESTION: ReviewQuestion = {
  id: '_default',
  text: 'Any updates on this item?',
  scope: 'project',
};
```

**`mockItems`** — used as fallback in dev when `sessionStorage` is empty (two sample ABC items with project questions).

**On mount** (`useEffect`) — reads `workstream_review_session` from `sessionStorage`; falls back to `mockItems` silently:
```ts
useEffect(() => {
  try {
    const raw = sessionStorage.getItem('workstream_review_session');
    if (raw) {
      const session = JSON.parse(raw);
      if (Array.isArray(session.items) && session.items.length > 0) {
        setSelectedWorkItems(session.items);
      }
    }
  } catch { /* ignore parse errors */ }
}, []);
```

**Item state initialisation** — whenever `selectedWorkItems` changes, each item's `ItemState` is reset with the first question as the opening system message:
```ts
useEffect(() => {
  const initialStates: Record<string, ItemState> = {};
  selectedWorkItems.forEach(item => {
    const questions = item.questions.length > 0 ? item.questions : [FALLBACK_QUESTION];
    initialStates[item.key] = {
      reviewed: false,
      messages: [{ role: 'system', content: questions[0].text }],
      answers: [],
    };
  });
  setItemStates(initialStates);
  setCurrentIndex(0);
  setInput('');
}, [selectedWorkItems]);
```

**`handleSend`** — advances through questions sequentially:
- Appends a `user` message for the current answer
- If more questions remain: appends the next question as a `system` message, stays on same item
- If all questions answered: marks item `reviewed: true`, increments `currentIndex` to next item

**`handleFinish`** — called when all items are reviewed. For each reviewed item it:
1. POSTs `WorkItem` snapshot to `POST /api/work-items`:
   ```json
   { "provider": "jira", "project_key": "...", "issue_key": "...", "title": "...", "description": "<intent>" }
   ```
2. POSTs answers to `POST /api/work-items/:issueKey/updates`:
   ```json
   { "provider": "jira", "project_key": "...", "answers": [...], "review_date": "<ISO>" }
   ```
3. Clears `sessionStorage.removeItem('workstream_review_session')` when all POSTs complete

**UI layout** — two-column layout:
- **Left column**: chat window showing `system`/`user` messages for the current item; input field locked until previous answer sent; "Finish" button appears when `currentIndex >= selectedWorkItems.length`
- **Right column (sidebar)**: list of all work items; active item highlighted; shows `X / N questions` progress indicator; completed items show a checkmark
