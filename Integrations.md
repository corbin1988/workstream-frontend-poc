### Epic — External Integrations (MVP)

Allow a Workstream user to connect external developer tools (Jira, GitHub later) so the system can ingest work items and activity.

MVP goals:

* User connects external account (Jira first)
* System stores OAuth tokens
* Workstream pulls issues assigned to the user
* Issues are used for **Daily Review** and **Workstream Cards**

Design supports multiple providers later.

---

# Infrastructure

---

## WORK-60

### Title

Create Integration Accounts Table + Repository

### Description

Store external accounts connected to a Workstream user.

This table maps **external identities → Workstream users** and stores OAuth tokens required to call provider APIs.

Scope:

* Create `integration_accounts` table
* Support multiple providers
* Store OAuth credentials
* Repository methods:

  * lookup by `user_id`
  * lookup by `provider`
  * lookup by `external_account_id`
  * update tokens

Table:

```sql
CREATE TABLE integration_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- jira, github, gitlab
    external_account_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, external_account_id),
    UNIQUE (user_id, provider)
);
```

Example rows:

```
user_id | provider | external_account_id
----------------------------------------
42      | jira     | 557058:abcd
42      | github   | 8834721
```

---

## WORK-61

### Title

Create External Work Items Table + Repository

### Description

Store tasks/issues pulled from external systems.

These are the **source tasks** used by Daily Review and Workstream cards.

Scope:

* Create `external_work_items` table
* Support multiple providers
* Repository methods:

  * lookup by user
  * lookup by external issue id
  * upsert issue state

Table:

```sql
CREATE TABLE external_work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    due_date TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, provider, external_id)
);
```

---

## WORK-62

### Title

Define Integration Service

### Description

Create a service responsible for interacting with external APIs and syncing data into Workstream.

Responsibilities:

* Initialize provider clients
* Fetch issues/tasks from providers
* Normalize fields
* Upsert work items

Conceptually:

```
Jira API
GitHub API
     ↓
Integration Service
     ↓
external_work_items
```

---

# Endpoints

---

## WORK-63

### Title

Start Provider OAuth Login

### Description

Redirect the user to the provider OAuth flow to connect their account.

Endpoint:

```
GET /auth/{provider}/login
```

Example:

```
GET /auth/jira/login
GET /auth/github/login
```

---

## WORK-64

### Title

Handle Provider OAuth Callback

### Description

Handle the OAuth callback and link the external account to the authenticated Workstream user.

Scope:

* exchange authorization code for tokens
* retrieve external identity
* store tokens in `integration_accounts`

Endpoint:

```
GET /auth/{provider}/callback
```

---

## WORK-65

### Title

Trigger External Work Sync

### Description

Fetch tasks/issues from the provider and store them locally.

Endpoint:

```
POST /integrations/{provider}/sync
```

Example:

```
POST /integrations/jira/sync
```

Scope:

* fetch issues assigned to the user
* upsert into `external_work_items`

---

## WORK-66

### Title

Get External Work Items

### Description

Return the synchronized tasks used for **Daily Review** and **Workstream Cards**.

Endpoint:

```
GET /integrations/{provider}/issues
```

---

# Final ticket structure

Infrastructure

```
WORK-60  Integration accounts table
WORK-61  External work items table
WORK-62  Integration service
```

Endpoints

```
WORK-63  OAuth login
WORK-64  OAuth callback
WORK-65  Trigger provider sync
WORK-66  Get external work items
```
