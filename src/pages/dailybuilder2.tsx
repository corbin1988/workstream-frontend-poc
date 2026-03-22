import { useState } from 'react';
import WorkDrawer4, { type ProjectItems } from '@/components/WorkDrawer4';

const EXPRESS_URL = process.env.NEXT_PUBLIC_EXPRESS_URL ?? 'http://localhost:3001';

interface DbMapping {
  provider: string;
  project_key: string;
  project_name: string;
  issue_types: { id: string; name: string }[];
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  status_mapping: {
    'To Do': string[];
    'In Progress': string[];
    'Done': string[];
    'Blocked': string[];
  };
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

// Recursively extracts plain text from an ADF (Atlassian Document Format) node
function extractAdfText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (typeof n.text === 'string') return n.text;
  if (Array.isArray(n.content)) {
    return (n.content as unknown[]).map(extractAdfText).join('');
  }
  return '';
}

function resolveDescriptionExcerpt(fields: Record<string, unknown>, fieldId: string, maxLen = 120): string | undefined {
  if (!fieldId) return undefined;
  const val = fields[fieldId];
  if (!val) return undefined;
  let text = '';
  if (typeof val === 'string') {
    text = val;
  } else if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    // ADF doc node
    if (obj.type === 'doc' && Array.isArray(obj.content)) {
      text = extractAdfText(obj);
    } else if (typeof obj.name === 'string') {
      text = obj.name;
    }
  }
  text = text.trim();
  if (!text) return undefined;
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
}

// Inverts the DB status_mapping ({ "In Progress": ["In Progress", "In Review"] })
// into a lookup map ({ "In Progress": "In Progress", "In Review": "In Progress" })
function buildStatusLookup(statusMapping: DbMapping['status_mapping']): Record<string, string> {
  const lookup: Record<string, string> = {};
  for (const [workstreamStatus, jiraStatuses] of Object.entries(statusMapping)) {
    for (const jiraStatus of jiraStatuses) {
      lookup[jiraStatus] = workstreamStatus;
    }
  }
  return lookup;
}

function getWorkstreamStatus(
  fields: Record<string, unknown>,
  statusFieldId: string,
  statusLookup: Record<string, string>
): string {
  const jiraStatusName = resolveFieldText(fields, statusFieldId) || resolveFieldText(fields, 'status');
  return statusLookup[jiraStatusName] ?? jiraStatusName;
}

export default function DailyBuilder() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectItems, setProjectItems] = useState<ProjectItems[]>([]);

  async function handleOpen() {
    setProjectItems([]);
    setLoading(true);
    setOpen(true);
    try {
      const mappingRes = await fetch(`${EXPRESS_URL}/api/mappings?provider=jira`);
      if (!mappingRes.ok) throw new Error('Failed to fetch mapping');
      const { mappings } = await mappingRes.json();
      if (!mappings?.length) throw new Error('No mapping configured');

      const results = await Promise.all(
        (mappings as DbMapping[]).map(async (mapping) => {
          const statusLookup = buildStatusLookup(mapping.status_mapping);
          const issueTypeFilter = mapping.issue_types.length > 0
            ? ` AND issueType in (${mapping.issue_types.map(t => `"${t.name}"`).join(', ')})`
            : '';
          const jql = `project = "${mapping.project_key}" AND assignee = currentUser() AND statusCategory != Done${issueTypeFilter} ORDER BY updated DESC`;
          const res = await fetch(
            `${EXPRESS_URL}/api/jira/search?jql=${encodeURIComponent(jql)}&maxResults=50&projectKey=${encodeURIComponent(mapping.project_key)}`
          );
          if (!res.ok) return { projectKey: mapping.project_key, projectName: mapping.project_name, activeInProgress: [] };
          const data = await res.json();
          const issues: Array<{ id: string; key: string; fields: Record<string, unknown> }> = data.issues ?? [];
          const activeInProgress: WorkItem[] = issues.map(issue => ({
            key: issue.key,
            title: resolveFieldText(issue.fields, mapping.title) || issue.key,
            intent: resolveDescriptionExcerpt(issue.fields, mapping.description),
            whyHere: getWorkstreamStatus(issue.fields, mapping.status, statusLookup),
          }));
          return { projectKey: mapping.project_key, projectName: mapping.project_name, activeInProgress };
        })
      );
      setProjectItems(results);
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
      </div>

      <WorkDrawer4
        isOpen={open}
        onClose={() => setOpen(false)}
        loading={loading}
        projects={projectItems}
      />
    </div>
  );
}

DailyBuilder.useLayout = false;