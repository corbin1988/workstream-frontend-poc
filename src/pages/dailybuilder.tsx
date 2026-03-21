import { useState, useEffect } from 'react';
import WorkDrawer3 from '../components/WorkDrawer3';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import WorkDrawer4 from '@/components/WorkDrawer4';

interface WorkstreamMapping {
  provider: string;
  project_key: string;
  project_name: string;
  issue_types: { id: string; name: string }[];
  field_mapping: {
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
  };
  status_mapping: Record<string, string>;
}

interface WorkItem {
  key: string;
  title: string;
  intent?: string;
  hasChanges?: boolean;
  whyHere?: string;
}

function resolveFieldText(fields: Record<string, unknown>, fieldId: string): string {
  const val = fields[fieldId];
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj.name === 'string') return obj.name;
  }
  return String(val);
}

function getWorkstreamStatus(
  fields: Record<string, unknown>,
  statusFieldId: string,
  statusMapping: Record<string, string>
): string {
  const jiraStatusName = resolveFieldText(fields, statusFieldId) || resolveFieldText(fields, 'status');
  return statusMapping[jiraStatusName] ?? jiraStatusName;
}

const DEFAULT_MAPPING: WorkstreamMapping = {
  provider: 'jira',
  project_key: 'WORK',
  project_name: 'Workstream',
  issue_types: [
    { id: '10009', name: 'Feature' },
    { id: '10007', name: 'Task' },
    { id: '10008', name: 'Story' },
    { id: '10010', name: 'Bug' },
    { id: '10005', name: 'Epic' },
  ],
  field_mapping: {
    title: 'summary',
    description: 'description',
    status: 'status',
    priority: 'priority',
    due_date: 'duedate',
  },
  status_mapping: {
    'Backlog': 'To Do',
    'To Do': 'To Do',
    'In Progress': 'In Progress',
    'Done': 'Done',
    'In Review': 'In Progress',
  },
};

export default function DailyBuilder() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inProgress, setInProgress] = useState<WorkItem[]>([]);
  const [suggested, setSuggested] = useState<Array<WorkItem & { reason: string }>>([]); 
  const [rawJson, setRawJson] = useState<object | null>(null);
  const [lastJql, setLastJql] = useState<string | null>(null);
  const [creds, setCreds] = useState({ email: '', token: '', domain: '' });

  useEffect(() => {
    fetch('/api/jira-creds').then(r => r.json()).then(d => {
      if (d.domain) setCreds({ email: d.email, token: d.token, domain: d.domain });
    });
  }, []);

  async function handleOpen() {
    setInProgress([]);
    setSuggested([]);
    setRawJson(null);
    setLoading(true);
    setOpen(true);
    try {
      const raw = localStorage.getItem('workstream_mapping');
      const mapping: WorkstreamMapping = raw ? JSON.parse(raw) : DEFAULT_MAPPING;

      const issueTypeFilter = mapping.issue_types.length > 0
        ? ` AND issueType in (${mapping.issue_types.map(t => `"${t.name}"`).join(', ')})`
        : '';
      const jql = `project = "${mapping.project_key}" AND assignee = currentUser() AND statusCategory != Done${issueTypeFilter} ORDER BY updated DESC`;
      setLastJql(jql);
      const res = await fetch(`/api/jira?jql=${encodeURIComponent(jql)}&maxResults=50`);
      if (!res.ok) return;
      const data = await res.json();
      setRawJson(data as object);
      const issues: Array<{ id: string; key: string; fields: Record<string, unknown> }> = data.issues ?? [];

      const newInProgress: WorkItem[] = [];

      for (const issue of issues) {
        const title =
          resolveFieldText(issue.fields, mapping.field_mapping.title) || issue.key;
        // Apply status_mapping from the saved mapping (e.g. "Backlog" → "To Do", "In Review" → "In Progress")
        const mappedStatus = getWorkstreamStatus(
          issue.fields,
          mapping.field_mapping.status,
          mapping.status_mapping
        );

        newInProgress.push({ key: issue.key, title, whyHere: mappedStatus });
      }

      setInProgress(newInProgress);
    } catch (e) {
      console.error('[DailyBuilder] Failed to load Jira issues:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleOpen}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          {loading ? 'Loading…' : 'Open Daily Review'}
        </button>
      {rawJson !== null && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Jira response captured — expand below
          </span>
        )}
      </div>

      {/* Reference card */}
      {lastJql && creds.domain && (
        <div className="mb-4 rounded-lg border border-cyan-700 bg-gray-900 p-4 text-sm">
          <div className="mb-2">
            <span className="text-gray-500 text-xs uppercase mr-2">Proxy</span>
            <span className="font-mono text-gray-300 text-xs break-all">
              GET /api/jira?jql={encodeURIComponent(lastJql)}&amp;maxResults=50
            </span>
          </div>
          <div className="flex items-start mb-2">
            <span className="text-gray-500 text-xs uppercase mr-2 shrink-0">Jira</span>
            <span className="font-mono text-yellow-300 text-xs break-all">
              POST https://{creds.domain}/rest/api/3/search/jql?expand=renderedFields
            </span>
          </div>
          <div className="mb-2 rounded bg-gray-800 px-3 py-1.5 font-mono text-xs text-green-300 break-all">
            {`{ "jql": "${lastJql}", "fields": ["*all"] }`}
          </div>
          <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300 whitespace-pre-wrap break-all">
            {`curl -X POST \\\n  -H "Authorization: Basic $(echo -n '${creds.email}:${creds.token}' | base64)" \\\n  -H "Accept: application/json" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify({ jql: lastJql, fields: ["*all"] })}' \\\n  "https://${creds.domain}/rest/api/3/search/jql?expand=renderedFields"`}
          </div>
        </div>
      )}

      {rawJson !== null && (
        <JsonView
          value={rawJson}
          style={{ ...darkTheme, borderRadius: '0.5rem', padding: '1rem', fontSize: '0.8rem' }}
        />
      )}

      <WorkDrawer4
        isOpen={open}
        onClose={() => setOpen(false)}
        loading={loading}
        activeInProgress={inProgress}
        suggested={suggested}
      />
    </div>
  );
}

DailyBuilder.useLayout = false;