I want to map my jira to my app to build workstream card and save the mapping to the backend. The db for this


## Database (This Might Change depending on the mapping)

Table:
```
CREATE TABLE work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, //Jira
    provider_id TEXT NOT NULL, // Jira
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    due_date TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, provider, provider_id)
);
```

## API FROM JIRA


### Projects List all projects. Paginated — repeat with startAt until total is reached.
GET https://network-community.atlassian.net/rest/api/3/project/search?startAt=0&maxResults=50

```
curl -H "Authorization: Basic $(echo -n 'your-email@example.com:YOUR_ATLASSIAN_API_TOKEN' | base64)" \
  -H "Accept: application/json" \
  "https://network-community.atlassian.net/rest/api/3/project/search?startAt=0&maxResults=50"
```

### Issue Types: List all issue types available in the instance.

GET https://network-community.atlassian.net/rest/api/3/issuetype

```
curl -H "Authorization: Basic $(echo -n 'your-email@example.com:YOUR_ATLASSIAN_API_TOKEN' | base64)" \
  -H "Accept: application/json" \
  "https://network-community.atlassian.net/rest/api/3/issuetype"

```

### Fields List all fields — both system and custom.

GET https://network-community.atlassian.net/rest/api/3/field

```
curl -H "Authorization: Basic $(echo -n 'your-email@example.com:YOUR_ATLASSIAN_API_TOKEN' | base64)" \
  -H "Accept: application/json" \
  "https://network-community.atlassian.net/rest/api/3/field"
```

I need to map each of these to something that's useable in my backend to make up the work stream. Create the forms that map each to the work stream card and then we'll create a a mock POST Request (Console log the mapping) for my backend that I'll save in the db. 