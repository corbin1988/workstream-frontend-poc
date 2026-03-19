import { useState, useEffect } from "react";
import { Button } from "flowbite-react";
import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";

const PLACEHOLDER_DOMAIN = "{JIRA_DOMAIN}";

// ---- Types ----------------------------------------------------------------

type JqlEntry = {
    kind: "jql";
    label: string;
    jql: string | null; // null = Schema (aggregated)
    description: string;
    color: string;
};

type DirectApiEntry = {
    kind: "direct";
    label: string;
    proxyUrl: string;
    method: "GET" | "POST";
    jiraPath: string | null;
    description: string;
    notes?: string;
};

type ActiveEntry = JqlEntry | DirectApiEntry | null;

// ---- Data -----------------------------------------------------------------

const JQL_BUTTONS: JqlEntry[] = [
    { kind: "jql", label: "All Issues",       color: "cyan",   jql: "project=WORK ORDER BY updated DESC",                                                               description: "All issues in WORK, newest first." },
    { kind: "jql", label: "Schema",           color: "cyan",   jql: null,                                                                                               description: "Server-side aggregation of projects, fields, statuses, priorities." },
    { kind: "jql", label: "My Issues",        color: "blue",   jql: "project=WORK AND assignee = currentUser() ORDER BY updated DESC",                                  description: "All issues assigned to the authenticated user." },
    { kind: "jql", label: "My Active Issues", color: "blue",   jql: "project=WORK AND assignee = currentUser() AND status != Done ORDER BY updated DESC",               description: "Open issues assigned to the authenticated user." },
    { kind: "jql", label: "In Progress",      color: "purple", jql: "project=WORK AND status = \"In Progress\" ORDER BY updated DESC",                                  description: "Issues currently in progress." },
    { kind: "jql", label: "Blocked",          color: "purple", jql: "project=WORK AND status = Blocked ORDER BY updated DESC",                                          description: "Blocked issues." },
    { kind: "jql", label: "Done This Week",   color: "purple", jql: "project=WORK AND status = Done AND updated >= -7d ORDER BY updated DESC",                         description: "Issues completed in the last 7 days." },
    { kind: "jql", label: "Done Last 2 Weeks",color: "pink",   jql: "project=WORK AND status = Done AND updated >= -14d ORDER BY updated DESC",                        description: "Issues completed in the last 14 days." },
    { kind: "jql", label: "High Priority",    color: "pink",   jql: "project=WORK AND priority in (Highest, High) ORDER BY priority ASC, updated DESC",                description: "Highest and High priority issues." },
    { kind: "jql", label: "Unassigned",       color: "pink",   jql: "project=WORK AND assignee is EMPTY ORDER BY created DESC",                                        description: "Issues with no assignee." },
];

const DIRECT_API_DOCS: DirectApiEntry[] = [
    { kind: "direct", label: "Projects",    proxyUrl: "/api/jira-projects",    method: "GET", jiraPath: "/rest/api/3/project/search?startAt=0&maxResults=50",           description: "List all projects. Paginated — repeat with startAt until total is reached." },
    { kind: "direct", label: "Issue Types", proxyUrl: "/api/jira-issue-types", method: "GET", jiraPath: "/rest/api/3/issuetype",                                        description: "List all issue types available in the instance." },
    { kind: "direct", label: "Fields",      proxyUrl: "/api/jira-fields",      method: "GET", jiraPath: "/rest/api/3/field",                                            description: "List all fields — both system and custom." },
    { kind: "direct", label: "Create Meta", proxyUrl: "/api/jira-createmeta",  method: "GET", jiraPath: "/rest/api/3/issue/createmeta?expand=projects.issuetypes.fields",description: "Returns the fields required to create an issue for each project + issue type." },
    { kind: "direct", label: "Bootstrap",   proxyUrl: "/api/jira-bootstrap",   method: "GET", jiraPath: null,                                                           description: "Aggregates /project/search + /issuetype in a single call via Promise.all.", notes: "No direct Jira equivalent — server-side aggregation." },
];

// ---- Helpers --------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button onClick={copy} className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}

function curlGet(path: string, email: string, token: string, domain: string): string {
    const cred = email && token ? `${email}:${token}` : "EMAIL:API_TOKEN";
    const d = domain || PLACEHOLDER_DOMAIN;
    return `curl -H "Authorization: Basic $(echo -n '${cred}' | base64)" \\\n  -H "Accept: application/json" \\\n  "https://${d}${path}"`;
}

function curlJql(jql: string, email: string, token: string, domain: string): string {
    const cred = email && token ? `${email}:${token}` : "EMAIL:API_TOKEN";
    const d = domain || PLACEHOLDER_DOMAIN;
    const body = JSON.stringify({ jql, fields: ["*all"] });
    return `curl -X POST \\\n  -H "Authorization: Basic $(echo -n '${cred}' | base64)" \\\n  -H "Accept: application/json" \\\n  -H "Content-Type: application/json" \\\n  -d '${body}' \\\n  "https://${d}/rest/api/3/search/jql?expand=renderedFields"`;
}

// ---- Component ------------------------------------------------------------

export default function JiraTest() {
    const [output, setOutput] = useState<any>(null);
    const [active, setActive] = useState<ActiveEntry>(null);
    const [creds, setCreds] = useState({ email: "", token: "", domain: PLACEHOLDER_DOMAIN });

    useEffect(() => {
        fetch("/api/jira-creds").then((r) => r.json()).then((d) => {
            if (d.domain) setCreds({ email: d.email, token: d.token, domain: d.domain });
        });
    }, []);

    const domain = creds.domain || PLACEHOLDER_DOMAIN;
    const base = `https://${domain}/rest/api/3`;

    const fetchJql = async (entry: JqlEntry) => {
        setActive(entry);
        const url = entry.jql
            ? `/api/jira?jql=${encodeURIComponent(entry.jql)}`
            : "/api/jira-schema";
        const res = await fetch(url);
        setOutput(await res.json());
    };

    const fetchDirect = async (entry: DirectApiEntry) => {
        setActive(entry);
        const res = await fetch(entry.proxyUrl);
        setOutput(await res.json());
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">

            {/* --- JQL buttons --- */}
            <div className="flex flex-wrap gap-2 mb-4">
                {JQL_BUTTONS.map((entry) => (
                    <Button key={entry.label} color={entry.color} onClick={() => fetchJql(entry)}>
                        {entry.label}
                    </Button>
                ))}
            </div>

            {/* --- Direct API buttons --- */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="self-center text-xs text-gray-400 font-semibold uppercase tracking-wide mr-1">Direct API</span>
                {DIRECT_API_DOCS.map((entry) => (
                    <Button key={entry.label} color="teal" onClick={() => fetchDirect(entry)}>
                        {entry.label}
                    </Button>
                ))}
            </div>

            {/* --- Reference card --- */}
            {active?.kind === "jql" && (
                <div className="mb-4 rounded-lg border border-cyan-700 bg-gray-900 p-4 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-cyan-400 font-bold">{active.label}</span>
                        <span className="text-gray-500 text-xs">{active.description}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-gray-500 text-xs uppercase mr-2">Proxy</span>
                        <span className="font-mono text-gray-300 text-xs">
                            {active.jql ? `GET /api/jira?jql=${encodeURIComponent(active.jql)}` : "GET /api/jira-schema"}
                        </span>
                    </div>
                    {active.jql ? (
                        <>
                            <div className="flex items-center mb-2">
                                <span className="text-gray-500 text-xs uppercase mr-2">Jira</span>
                                <span className="font-mono text-yellow-300 text-xs break-all">
                                    POST https://{domain}/rest/api/3/search/jql?expand=renderedFields
                                </span>
                                <CopyButton text={`https://${domain}/rest/api/3/search/jql?expand=renderedFields`} />
                            </div>
                            <div className="mb-2 rounded bg-gray-800 px-3 py-1.5 font-mono text-xs text-green-300 break-all">
                                {`{ "jql": "${active.jql}", "fields": ["*all"] }`}
                                <CopyButton text={JSON.stringify({ jql: active.jql, fields: ["*all"] })} />
                            </div>
                            <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300 whitespace-pre">
                                {curlJql(active.jql, creds.email, creds.token, domain)}
                                <CopyButton text={curlJql(active.jql, creds.email, creds.token, domain)} />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2 mt-1">
                            <div className="text-gray-400 text-xs mb-1">Aggregates these 4 Jira calls in parallel:</div>
                            {[
                                "/rest/api/3/project/search?maxResults=100",
                                "/rest/api/3/field",
                                "/rest/api/3/status",
                                "/rest/api/3/priority",
                            ].map((path) => (
                                <div key={path} className="rounded bg-gray-800 px-3 py-2">
                                    <div className="flex items-center mb-1">
                                        <span className="font-mono text-yellow-300 text-xs break-all">GET https://{domain}{path}</span>
                                        <CopyButton text={`https://${domain}${path}`} />
                                    </div>
                                    <div className="font-mono text-xs text-gray-300 whitespace-pre">{curlGet(path, creds.email, creds.token, domain)}<CopyButton text={curlGet(path, creds.email, creds.token, domain)} /></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {active?.kind === "direct" && (
                <div className="mb-4 rounded-lg border border-teal-700 bg-gray-900 p-4 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-teal-400 font-bold">{active.label}</span>
                        <span className="text-gray-500 text-xs">{active.description}</span>
                    </div>
                    <div className="mb-1">
                        <span className="text-gray-500 text-xs uppercase mr-2">Proxy</span>
                        <span className="font-mono text-gray-300 text-xs">{active.method} {active.proxyUrl}</span>
                    </div>
                    {active.jiraPath ? (
                        <>
                            <div className="flex items-center mb-2">
                                <span className="text-gray-500 text-xs uppercase mr-2">Jira</span>
                                <span className="font-mono text-yellow-300 text-xs break-all">
                                    {active.method} https://{domain}{active.jiraPath}
                                </span>
                                <CopyButton text={`https://${domain}${active.jiraPath}`} />
                            </div>
                            <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300 whitespace-pre">
                                {curlGet(active.jiraPath, creds.email, creds.token, domain)}
                                <CopyButton text={curlGet(active.jiraPath, creds.email, creds.token, domain)} />
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500 text-xs italic">{active.notes}</div>
                    )}
                </div>
            )}

            {/* --- JSON output --- */}
            {output && (
                <JsonView value={output} style={{ ...darkTheme, borderRadius: "0.5rem", padding: "1rem", fontSize: "0.8rem" }} />
            )}

            {/* --- API Reference table --- */}
            <div className="mt-10">
                <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">JQL Search Reference</h2>
                <div className="rounded-lg border border-gray-700 overflow-hidden mb-8">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-800 text-gray-400">
                            <tr>
                                <th className="px-3 py-2 w-36">Button</th>
                                <th className="px-3 py-2">Jira Endpoint</th>
                                <th className="px-3 py-2">JQL / Body</th>
                                <th className="px-3 py-2 w-16">cURL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {JQL_BUTTONS.map((entry) => (
                                <tr key={entry.label} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                                    <td className="px-3 py-2 text-cyan-400 font-semibold whitespace-nowrap">{entry.label}</td>
                                    <td className="px-3 py-2 font-mono text-yellow-300 break-all">
                                        {entry.jql
                                            ? <>{`POST ${base}/search/jql`} <CopyButton text={`${base}/search/jql?expand=renderedFields`} /></>
                                            : <span className="text-gray-500 italic">aggregated</span>}
                                    </td>
                                    <td className="px-3 py-2 font-mono text-green-300 break-all">
                                        {entry.jql
                                            ? <>{`{ "jql": "${entry.jql}" }`} <CopyButton text={JSON.stringify({ jql: entry.jql, fields: ["*all"] })} /></>
                                            : <span className="text-gray-500 italic">{entry.description}</span>}
                                    </td>
                                    <td className="px-3 py-2">
                                        {entry.jql && <CopyButton text={curlJql(entry.jql, creds.email, creds.token, domain)} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Direct API Reference</h2>
                <div className="rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-800 text-gray-400">
                            <tr>
                                <th className="px-3 py-2 w-28">Endpoint</th>
                                <th className="px-3 py-2">Jira URL</th>
                                <th className="px-3 py-2">Description</th>
                                <th className="px-3 py-2 w-16">cURL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {DIRECT_API_DOCS.map((entry) => (
                                <tr key={entry.label} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                                    <td className="px-3 py-2 text-teal-400 font-semibold whitespace-nowrap">{entry.label}</td>
                                    <td className="px-3 py-2 font-mono text-yellow-300 break-all">
                                        {entry.jiraPath
                                            ? <>{`${base}${entry.jiraPath.replace("/rest/api/3", "")}`} <CopyButton text={`${base}${entry.jiraPath.replace("/rest/api/3", "")}`} /></>
                                            : <span className="text-gray-500 italic">aggregated</span>}
                                    </td>
                                    <td className="px-3 py-2 text-gray-400">{entry.description}{entry.notes && <span className="italic text-gray-600"> {entry.notes}</span>}</td>
                                    <td className="px-3 py-2">
                                        {entry.jiraPath && <CopyButton text={curlGet(entry.jiraPath, creds.email, creds.token, domain)} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Opt out of the main layout
JiraTest.useLayout = false;
