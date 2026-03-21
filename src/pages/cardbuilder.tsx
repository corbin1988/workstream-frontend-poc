import { useState } from "react";
import { Avatar, Badge, Button, Card, Checkbox, Label, Select, Spinner } from "flowbite-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { JiraProject } from "./api/jira-projects";
import type { JiraIssueType } from "./api/jira-issue-types";
import type { JiraField } from "./api/jira-fields";
import type { DevInfoResponse, DevBranch, DevPullRequest, DevBuild } from "./api/jira-devinfo";

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
function formatRelativeDate(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days ago`;
}

const WORKSTREAM_FIELDS: { key: keyof FieldMapping; label: string; defaultJiraId: string }[] = [
    { key: "title",       label: "Title",       defaultJiraId: "summary"     },
    { key: "description", label: "Description", defaultJiraId: "description" },
    { key: "status",      label: "Status",      defaultJiraId: "status"      },
    { key: "priority",    label: "Priority",    defaultJiraId: "priority"    },
    { key: "due_date",    label: "Due Date",    defaultJiraId: "duedate"     },
];

type FieldMapping = {
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
};

type JiraComment = {
    id: string;
    author: { displayName: string };
    body: string;
    created: string;
};

type PrSummary = { count: number; state: string; lastUpdated: string };

function parsePrSummary(raw: string | null | undefined): PrSummary | null {
    if (!raw || raw === "{}") return null;
    try {
        const jsonIdx = raw.lastIndexOf("json=");
        if (jsonIdx === -1) return null;
        // The JSON value runs from `json={` to the second-to-last `}` (last `}` closes outer wrapper)
        const jsonStr = raw.slice(jsonIdx + 5, raw.length - 1);
        const parsed = JSON.parse(jsonStr);
        const pr = parsed?.cachedValue?.summary?.pullrequest?.overall;
        if (!pr || !pr.count) return null;
        return { count: pr.count, state: pr.state, lastUpdated: pr.lastUpdated };
    } catch {
        return null;
    }
}

type JiraIssue = {
    id: string;
    key: string;
    fields: {
        summary: string;
        description: unknown;
        status: { name: string; statusCategory: { name: string } };
        assignee: { displayName: string; avatarUrls: Record<string, string> } | null;
        updated: string;
        comment?: { comments: JiraComment[] };
        customfield_10000?: string | null;
        [key: string]: unknown;
    };
};

// ── Mock data for DB-sourced fields (standup, previous updates, workstream comments) ──
const mockDbComments = [
    { id: 1, author: "Jane Doe", created_at: "2026-03-18T09:00:00Z", type: "context", body: "Looks great so far, keep going!" },
    { id: 2, author: "Alex Kim", created_at: "2026-03-18T11:30:00Z", type: "decision", body: "We agreed to use Flowbite components." },
];

const mockStandupYesterday = "Worked on card layout\nFixed avatar alignment\nHooked up git branch display";
const mockStandupToday = "Complete field mapping UI\nWire up live Jira preview";

const mockPreviousUpdates: { date: string; recent_changes: string; next_focus: string; context: string | null }[] = [
    {
        date: "2026-03-18T00:00:00Z",
        recent_changes: "Set up base component structure and added Flowbite Avatar.",
        next_focus: "Add git info section and PR comment threading.",
        context: "Waiting on design review before finalising colours.",
    },
    {
        date: "2026-03-17T00:00:00Z",
        recent_changes: "Created initial page and routing.",
        next_focus: "Stub out mock data shapes.",
        context: null,
    },
];

export default function CardBuilder() {
    const [openSection, setOpenSection] = useState<string>("");

    // Wizard state
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

    // Step 1 — Connection
    const [connStatus, setConnStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [connMessage, setConnMessage] = useState<string>("");

    // Step 2 — Projects
    const [projects, setProjects] = useState<JiraProject[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string>("");

    // Step 3 — Issue Types
    const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
    const [issueTypesLoading, setIssueTypesLoading] = useState(false);
    const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([]);

    // Step 4 — Field Mapping
    const [fields, setFields] = useState<JiraField[]>([]);
    const [fieldsLoading, setFieldsLoading] = useState(false);
    const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
        title:       "summary",
        description: "description",
        status:      "status",
        priority:    "priority",
        due_date:    "duedate",
    });

    // Step 5 — Saved payload
    const [savedPayload, setSavedPayload] = useState<object | null>(null);

    // Live Jira issue state
    const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>([]);
    const [issuesLoading, setIssuesLoading] = useState(false);
    const [selectedIssueKey, setSelectedIssueKey] = useState<string>("");
    const [liveIssue, setLiveIssue] = useState<JiraIssue | null>(null);

    // GitHub dev info via Jira Dev Status API
    const [devInfo, setDevInfo] = useState<DevInfoResponse | null>(null);
    const [devInfoLoading, setDevInfoLoading] = useState(false);

    function resolveField(fieldId: string): unknown {
        if (!liveIssue || !fieldId) return undefined;
        return liveIssue.fields[fieldId];
    }

    function resolveText(fieldId: string): string {
        const val = resolveField(fieldId);
        if (!val) return "";
        if (typeof val === "string") return val;
        if (typeof val === "object" && val !== null) {
            // Handle Jira status/priority objects
            const obj = val as Record<string, unknown>;
            if (typeof obj.name === "string") return obj.name;
            if (typeof obj.statusCategory === "object" && obj.statusCategory !== null) {
                const cat = obj.statusCategory as Record<string, unknown>;
                if (typeof cat.name === "string") return cat.name;
            }
        }
        return String(val);
    }

    const card = liveIssue ? {
        issue_key: liveIssue.key,
        jiraIssueId: liveIssue.id,
        assignee: liveIssue.fields.assignee?.displayName ?? "Unassigned",
        intent_frozen_at: liveIssue.fields.updated,
        status_category: (() => {
            const statusFieldId = fieldMapping.status;
            const statusVal = liveIssue.fields[statusFieldId];
            if (statusVal && typeof statusVal === "object") {
                const s = statusVal as Record<string, unknown>;
                if (s.statusCategory && typeof s.statusCategory === "object") {
                    return (s.statusCategory as Record<string, unknown>).name as string ?? "To Do";
                }
                if (typeof s.name === "string") return s.name;
            }
            return liveIssue.fields.status?.statusCategory?.name ?? liveIssue.fields.status?.name ?? "To Do";
        })(),
        title: resolveText(fieldMapping.title) || liveIssue.fields.summary,
        description: (() => {
            const val = resolveField(fieldMapping.description);
            return typeof val === "string" ? val : "";
        })(),
        priority: resolveText(fieldMapping.priority),
        due_date: resolveText(fieldMapping.due_date),
        jiraComments: liveIssue.fields.comment?.comments ?? [],
    } : null;

    const prSummary: PrSummary | null = parsePrSummary(liveIssue?.fields.customfield_10000);

    function toggle(section: string) {
        setOpenSection((prev) => (prev === section ? "" : section));
    }

    async function testConnection() {
        setConnStatus("loading");
        setConnMessage("");
        try {
            const res = await fetch("/api/jira-ping");
            const data = await res.json();
            if (res.ok) {
                setConnStatus("success");
                setConnMessage(`Connected! ${data.deploymentType === "Cloud" ? "Jira Cloud" : "Jira"} — ${data.serverTitle ?? ""} v${data.version ?? "?"}`);
            } else {
                setConnStatus("error");
                setConnMessage(`Failed: ${data.error ?? res.statusText}`);
            }
        } catch (err: any) {
            setConnStatus("error");
            setConnMessage(`Error: ${err?.message ?? "Could not reach server"}`);
        }
    }

    async function goToProjects() {
        setProjectsLoading(true);
        try {
            const res = await fetch("/api/jira-projects");
            const data = await res.json();
            const projectList: JiraProject[] = data.projects ?? [];
            setProjects(projectList);
            if (projectList.length > 0) {
                setSelectedProject(projectList[0].key);
                loadIssues(projectList[0].key);
            }
        } finally {
            setProjectsLoading(false);
            setStep(2);
        }
    }

    async function loadIssues(projectKey: string) {
        if (!projectKey) return;
        setIssuesLoading(true);
        setJiraIssues([]);
        setLiveIssue(null);
        setSelectedIssueKey("");
        setDevInfo(null);
        try {
            const jql = encodeURIComponent(`project = "${projectKey}" ORDER BY updated DESC`);
            const res = await fetch(`/api/jira?jql=${jql}&maxResults=30`);
            const data = await res.json();
            const issues: JiraIssue[] = data.issues ?? [];
            setJiraIssues(issues);
            if (issues.length > 0) {
                setSelectedIssueKey(issues[0].key);
                setLiveIssue(issues[0]);
                fetchDevInfo(issues[0].id);
            }
        } finally {
            setIssuesLoading(false);
        }
    }

    async function fetchDevInfo(issueId: string) {
        setDevInfoLoading(true);
        setDevInfo(null);
        try {
            const res = await fetch(`/api/jira-devinfo?issueId=${issueId}`);
            const data: DevInfoResponse = await res.json();
            setDevInfo(data);
        } catch {
            setDevInfo({ branches: [], pullRequests: [], builds: [] });
        } finally {
            setDevInfoLoading(false);
        }
    }

    async function goToIssueTypes() {
        setIssueTypesLoading(true);
        try {
            const res = await fetch("/api/jira-issue-types");
            const data = await res.json();
            const selectedProjectId = projects.find((p) => p.key === selectedProject)?.id;
            const types: JiraIssueType[] = (data.issueTypes ?? []).filter((t: JiraIssueType) => {
                if (t.subtask) return false;
                return t.scope?.type === "PROJECT" && t.scope.project?.id === selectedProjectId;
            });
            setIssueTypes(types);
            setSelectedIssueTypes(types.map((t) => t.id));
        } finally {
            setIssueTypesLoading(false);
            setStep(3);
        }
    }

    async function goToFieldMapping() {
        setFieldsLoading(true);
        try {
            const res = await fetch("/api/jira-fields");
            const data = await res.json();
            setFields(data.fields ?? []);
        } finally {
            setFieldsLoading(false);
            setStep(4);
        }
    }

    function toggleIssueType(id: string) {
        setSelectedIssueTypes((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    function saveMapping() {
        const project = projects.find((p) => p.key === selectedProject);
        const payload = {
            provider: "jira",
            project_key: selectedProject,
            project_name: project?.name ?? "",
            issue_type_ids: selectedIssueTypes,
            issue_type_names: issueTypes
                .filter((t) => selectedIssueTypes.includes(t.id))
                .map((t) => t.name),
            field_mapping: fieldMapping,
        };
        console.log("[Workstream] POST /api/work-item-mappings", JSON.stringify(payload, null, 2));
        setSavedPayload(payload);
        setStep(5);
    }

    const STEP_LABELS = ["Connect", "Project", "Issue Types", "Field Map", "Done"];

    return (
        <div className="flex bg-gray-100 dark:bg-gray-900 p-6">
            <section className="w-3/8 p-6 space-y-4">

                {/* Step indicator */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    {STEP_LABELS.map((label, i) => {
                        const s = (i + 1) as 1 | 2 | 3 | 4 | 5;
                        const active = step === s;
                        const done = step > s;
                        return (
                            <span key={s} className="flex items-center gap-1">
                                <span className={`font-semibold ${active ? "text-blue-600 dark:text-blue-400" : done ? "text-green-600 dark:text-green-400" : ""}`}>
                                    {done ? "✓" : s}. {label}
                                </span>
                                {i < STEP_LABELS.length - 1 && <span className="text-gray-300 dark:text-gray-600">›</span>}
                            </span>
                        );
                    })}
                </div>

                {/* Step 1: Connect */}
                <Card>
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Step 1 — Connect to Jira</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Credentials are read from <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env.local</code> (JIRA_EMAIL, JIRA_API_TOKEN, JIRA_DOMAIN).
                    </p>
                    <Button
                        size="sm"
                        onClick={testConnection}
                        disabled={connStatus === "loading"}
                        color={connStatus === "success" ? "success" : connStatus === "error" ? "failure" : "blue"}
                    >
                        {connStatus === "loading" && <Spinner size="sm" className="mr-2" />}
                        {connStatus === "success" ? "Connected ✓" : connStatus === "error" ? "Retry Connection" : "Test Connection"}
                    </Button>
                    {connStatus !== "idle" && connStatus !== "loading" && (
                        <p className={`text-xs mt-2 ${connStatus === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {connMessage}
                        </p>
                    )}
                    {connStatus === "success" && step === 1 && (
                        <Button size="sm" className="mt-3" onClick={goToProjects} disabled={projectsLoading}>
                            {projectsLoading && <Spinner size="sm" className="mr-2" />}Next — Select Project
                        </Button>
                    )}
                </Card>

                {/* Step 2: Project */}
                {step >= 2 && (
                    <Card>
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Step 2 — Select Project</h5>
                        {projectsLoading ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500"><Spinner size="sm" />Loading projects…</div>
                        ) : (
                            <>
                                <Label htmlFor="project-select" className="text-xs mb-1 block">Jira Project</Label>
                                <Select
                                    id="project-select"
                                    value={selectedProject}
                                    onChange={(e) => {
                                        setSelectedProject(e.target.value);
                                        loadIssues(e.target.value);
                                    }}
                                    sizing="sm"
                                >
                                    {projects.map((p) => (
                                        <option key={p.key} value={p.key}>
                                            [{p.key}] {p.name}
                                        </option>
                                    ))}
                                </Select>

                                {issuesLoading && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                        <Spinner size="sm" />Loading tickets…
                                    </div>
                                )}
                                {!issuesLoading && jiraIssues.length > 0 && (
                                    <div className="mt-3">
                                        <Label htmlFor="issue-select" className="text-xs mb-1 block">Preview ticket</Label>
                                        <Select
                                            id="issue-select"
                                            value={selectedIssueKey}
                                            onChange={(e) => {
                                                const issue = jiraIssues.find((i) => i.key === e.target.value);
                                                setSelectedIssueKey(e.target.value);
                                                setLiveIssue(issue ?? null);
                                                if (issue) fetchDevInfo(issue.id);
                                            }}
                                            sizing="sm"
                                        >
                                            {jiraIssues.map((i) => (
                                                <option key={i.key} value={i.key}>
                                                    [{i.key}] {i.fields.summary.slice(0, 45)}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                )}

                                {step === 2 && (
                                    <Button size="sm" className="mt-3" onClick={goToIssueTypes} disabled={!selectedProject || issueTypesLoading}>
                                        {issueTypesLoading && <Spinner size="sm" className="mr-2" />}Next — Issue Types
                                    </Button>
                                )}
                            </>
                        )}
                    </Card>
                )}

                {/* Step 3: Issue Types */}
                {step >= 3 && (
                    <Card>
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Step 3 — Issue Types to Sync</h5>
                        {issueTypesLoading ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500"><Spinner size="sm" />Loading issue types…</div>
                        ) : (
                            <>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select which Jira issue types map to Workstream cards.</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {issueTypes.map((t) => {
                                        let projectLabel = "Global";
                                        if (t.scope?.type === "PROJECT" && t.scope.project?.id) {
                                            const match = projects.find((p) => p.id === t.scope!.project!.id);
                                            projectLabel = match ? `${match.key} — ${match.name}` : `id:${t.scope.project.id}`;
                                        }
                                        return (
                                            <div key={t.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`it-${t.id}`}
                                                    checked={selectedIssueTypes.includes(t.id)}
                                                    onChange={() => toggleIssueType(t.id)}
                                                />
                                                <Label htmlFor={`it-${t.id}`} className="text-xs cursor-pointer flex items-center gap-1.5">
                                                    {t.name}
                                                    <span className="text-gray-400 dark:text-gray-500 font-mono">[{projectLabel}]</span>
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                                {step === 3 && (
                                    <Button size="sm" className="mt-3" onClick={goToFieldMapping} disabled={selectedIssueTypes.length === 0 || fieldsLoading}>
                                        {fieldsLoading && <Spinner size="sm" className="mr-2" />}Next — Map Fields
                                    </Button>
                                )}
                            </>
                        )}
                    </Card>
                )}

                {/* Step 4: Field Mapping */}
                {step >= 4 && (
                    <Card>
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Step 4 — Map Jira Fields</h5>
                        {fieldsLoading ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500"><Spinner size="sm" />Loading fields…</div>
                        ) : (
                            <>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    Map each Workstream column to the Jira field that should populate it.
                                </p>
                                <div className="space-y-3">
                                    {WORKSTREAM_FIELDS.map(({ key, label }) => (
                                        <div key={key}>
                                            <Label htmlFor={`fm-${key}`} className="text-xs mb-1 block">
                                                <span className="font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                                                <span className="ml-1 text-gray-400">→ work_items.{key}</span>
                                            </Label>
                                            <Select
                                                id={`fm-${key}`}
                                                sizing="sm"
                                                value={fieldMapping[key]}
                                                onChange={(e) => setFieldMapping((prev) => ({ ...prev, [key]: e.target.value }))}
                                            >
                                                <option value="">— unmapped —</option>
                                                {fields.map((f) => (
                                                    <option key={f.id} value={f.id}>
                                                        {f.name} ({f.id})
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    ))}
                                </div>
                                {step === 4 && (
                                    <Button size="sm" color="success" className="mt-4" onClick={saveMapping}>
                                        Save Mapping
                                    </Button>
                                )}
                            </>
                        )}
                    </Card>
                )}

                {/* Step 5: Done */}
                {step === 5 && savedPayload && (
                    <Card>
                        <h5 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✓ Mapping Saved</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            The payload below was logged to the console (POST /api/work-item-mappings).
                        </p>
                        <pre className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                            {JSON.stringify(savedPayload, null, 2)}
                        </pre>
                        <Button
                            size="sm"
                            color="light"
                            className="mt-3"
                            onClick={() => {
                                setStep(1);
                                setConnStatus("idle");
                                setConnMessage("");
                                setProjects([]);
                                setSelectedProject("");
                                setIssueTypes([]);
                                setSelectedIssueTypes([]);
                                setFields([]);
                                setFieldMapping({ title: "summary", description: "description", status: "status", priority: "priority", due_date: "duedate" });
                                setSavedPayload(null);
                            }}
                        >
                            Start Over
                        </Button>
                    </Card>
                )}

            </section>
            <section className="w-5/8 p-6">
                {!card ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600 gap-3">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">Connect Jira and select a project to preview a ticket</p>
                    </div>
                ) : (
                <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">

                    {/* Header — from Jira */}
                    <div className="flex items-start gap-3">
                        <Avatar alt={card.assignee} img="" placeholderInitials={getInitials(card.assignee)} rounded size="md" className="shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{card.assignee}</span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500 text-sm">{formatTime(card.intent_frozen_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{card.issue_key}</span>
                                <Badge size="xs" className={
                                    card.status_category === "In Progress" ? "bg-yellow-900 text-yellow-300 border border-yellow-700"
                                        : card.status_category === "Done" ? "bg-green-900 text-green-300 border border-green-700"
                                            : "bg-gray-700 text-gray-300 border border-gray-600"
                                }>
                                    {card.status_category}
                                </Badge>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mt-3 ml-0 sm:ml-13 min-w-0">
                        {/* Git row — from Jira Dev Status / GitHub */}
                        {devInfoLoading ? (
                            <div className="mb-3 flex items-center gap-2 text-xs text-gray-400"><Spinner size="sm" />Loading GitHub data…</div>
                        ) : devInfo && (devInfo.branches.length > 0 || devInfo.pullRequests.length > 0) ? (
                            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                                {devInfo.branches.slice(0, 1).map((b: DevBranch) => (
                                    <div key={b.name ?? "branch"} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 min-w-0">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {b.url ? (
                                            <a href={b.url} target="_blank" rel="noreferrer" className="font-mono truncate hover:underline text-blue-600 dark:text-blue-400">{b.name}</a>
                                        ) : (
                                            <span className="font-mono truncate">{b.name}</span>
                                        )}
                                    </div>
                                ))}
                                {devInfo.branches.length > 1 && (
                                    <span className="text-gray-500">+{devInfo.branches.length - 1} branch{devInfo.branches.length - 1 > 1 ? "es" : ""}</span>
                                )}
                                {devInfo.branches.length > 0 && devInfo.branches[0].lastCommit && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        {devInfo.branches[0].lastCommit.additions !== undefined ? (
                                            <span>
                                                <span className="text-green-600 dark:text-green-400 font-medium">+{devInfo.branches[0].lastCommit.additions}</span>{" "}
                                                <span className="text-red-600 dark:text-red-400 font-medium">-{devInfo.branches[0].lastCommit.deletions}</span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 font-mono">{devInfo.branches[0].lastCommit.shortId}</span>
                                        )}
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <span className="text-gray-500">Updated {formatRelativeDate(devInfo.branches[0].lastCommit.authorTimestamp)}</span>
                                    </>
                                )}
                                {devInfo.pullRequests.length > 0 && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        {devInfo.pullRequests.slice(0, 1).map((pr: DevPullRequest) => (
                                            <div key={pr.id} className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                {pr.url ? (
                                                    <a href={pr.url} target="_blank" rel="noreferrer" className="text-gray-600 dark:text-gray-400 hover:underline">PR #{pr.id}</a>
                                                ) : (
                                                    <span className="text-gray-600 dark:text-gray-400">PR #{pr.id}</span>
                                                )}
                                                <Badge size="xs" className={
                                                    pr.status === "OPEN" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    : pr.status === "MERGED" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                }>{pr.status.toLowerCase()}</Badge>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {devInfo.builds.length > 0 && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`inline-block w-2 h-2 rounded-full ${devInfo.builds[0].state === "successful" ? "bg-green-500" : devInfo.builds[0].state === "failed" ? "bg-red-500" : "bg-yellow-400"}`} />
                                            <span className="text-gray-500">{devInfo.builds[0].state}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : prSummary ? (
                            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                                <svg className="w-3.5 h-3.5 text-purple-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-gray-600 dark:text-gray-400">{prSummary.count} pull request{prSummary.count > 1 ? "s" : ""}</span>
                                <Badge size="xs" className={
                                    prSummary.state === "OPEN" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : prSummary.state === "MERGED" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                }>{prSummary.state.toLowerCase()}</Badge>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="text-gray-500">Updated {formatRelativeDate(prSummary.lastUpdated)}</span>
                            </div>
                        ) : null}

                        {/* Title + description — from Jira (resolved via fieldMapping) */}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{card.title}</h3>

                        {/* Mapped fields strip: priority, due_date */}
                        {(card.priority || card.due_date) && (
                            <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-gray-500 dark:text-gray-400">
                                {card.priority && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                        <span className="font-medium">Priority:</span> {card.priority}
                                    </span>
                                )}
                                {card.due_date && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                        <span className="font-medium">Due:</span> {card.due_date}
                                    </span>
                                )}
                            </div>
                        )}

                        {card.description && (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.description}</ReactMarkdown>
                            </div>
                        )}

                        {/* Standup — from Workstream DB (mock) */}
                        <div className="mt-4 space-y-3">
                            <div className="pl-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-gray-900/50 rounded-r p-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What did you do since yesterday?</h4>
                                <ul className="space-y-1">
                                    {mockStandupYesterday.split("\n").map((item, idx) => (
                                        <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                                            <span className="mr-2">•</span><span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="pl-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 rounded-r p-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What will you do today?</h4>
                                <ul className="space-y-1">
                                    {mockStandupToday.split("\n").map((item, idx) => (
                                        <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                                            <span className="mr-2">•</span><span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between gap-2">
                                <button onClick={() => toggle("code")} className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${openSection === "code" ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"}`}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    Code {devInfo && devInfo.pullRequests.length > 0 ? <span className="text-gray-400">({devInfo.pullRequests.length} PR{devInfo.pullRequests.length > 1 ? "s" : ""})</span> : prSummary ? <span className="text-gray-400">({prSummary.count} PR{prSummary.count > 1 ? "s" : ""})</span> : null}
                                </button>
                                <button onClick={() => toggle("previous")} className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${openSection === "previous" ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"}`}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                    {mockPreviousUpdates.length} previous
                                </button>
                                <button onClick={() => toggle("comments")} className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${openSection === "comments" ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"}`}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                                    {card.jiraComments.length + mockDbComments.length} comment{(card.jiraComments.length + mockDbComments.length) !== 1 ? "s" : ""}
                                </button>
                            </div>

                            {openSection && (
                                <div className="mt-3">
                                    {openSection === "code" && (
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
                                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Code Activity</h5>

                                            {/* Branches */}
                                            {devInfo && devInfo.branches.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Branches</p>
                                                    <div className="space-y-2">
                                                        {devInfo.branches.map((b: DevBranch) => (
                                                            <div key={b.name} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                    <a href={b.url} target="_blank" rel="noreferrer" className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline truncate">{b.name}</a>
                                                                    <span className="text-xs text-gray-400">{b.repository?.name}</span>
                                                                </div>
                                                                {b.lastCommit && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <a href={b.lastCommit.url} target="_blank" rel="noreferrer" className="font-mono text-blue-500 hover:underline">{b.lastCommit.shortId}</a>
                                                                            <span>{b.lastCommit.message}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-gray-400">
                                                                            <span>{b.lastCommit.author?.name}</span>
                                                                            <span>·</span>
                                                                            <span>{formatDate(b.lastCommit.authorTimestamp)}</span>
                                                                            {b.lastCommit.additions !== undefined && (
                                                                                <>
                                                                                    <span>·</span>
                                                                                    <span className="text-green-600 dark:text-green-400">+{b.lastCommit.additions}</span>
                                                                                    <span className="text-red-600 dark:text-red-400">-{b.lastCommit.deletions}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pull Requests */}
                                            {devInfo && devInfo.pullRequests.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pull Requests</p>
                                                    <div className="space-y-2">
                                                        {devInfo.pullRequests.map((pr: DevPullRequest) => (
                                                            <div key={pr.id} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <a href={pr.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-900 dark:text-white hover:underline">{pr.title}</a>
                                                                    <Badge size="xs" className={
                                                                        pr.status === "OPEN" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                                        : pr.status === "MERGED" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                                    }>{pr.status.toLowerCase()}</Badge>
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2">
                                                                    <span className="font-mono">{pr.sourceBranch}</span>
                                                                    <span>→</span>
                                                                    <span className="font-mono">{pr.destinationBranch}</span>
                                                                    <span>·</span>
                                                                    <span>{pr.author?.name}</span>
                                                                    <span>·</span>
                                                                    <span>{formatRelativeDate(pr.lastUpdate)}</span>
                                                                    {pr.commentCount > 0 && (
                                                                        <span className="text-gray-400">· {pr.commentCount} comment{pr.commentCount > 1 ? "s" : ""}</span>
                                                                    )}
                                                                </div>
                                                                {pr.reviewers?.length > 0 && (
                                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                                        {pr.reviewers.map((r) => (
                                                                            <span key={r.name} className={`text-xs px-1.5 py-0.5 rounded ${r.approvalStatus === "APPROVED" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                                                                                {r.approvalStatus === "APPROVED" ? "✓ " : ""}{r.name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Builds */}
                                            {devInfo && devInfo.builds.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Builds</p>
                                                    <div className="space-y-2">
                                                        {devInfo.builds.map((build: DevBuild) => (
                                                            <div key={build.id} className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                                                                <span className={`shrink-0 inline-block w-2.5 h-2.5 rounded-full ${build.state === "successful" ? "bg-green-500" : build.state === "failed" ? "bg-red-500" : "bg-yellow-400"}`} />
                                                                <div className="flex-1 min-w-0">
                                                                    <a href={build.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-900 dark:text-white hover:underline">{build.name || `Build #${build.buildNumber}`}</a>
                                                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                                        <span>{build.state}</span>
                                                                        <span>·</span>
                                                                        <span>{formatDate(build.createdAt)}</span>
                                                                        {build.testSummary && (
                                                                            <>
                                                                                <span>·</span>
                                                                                <span>{build.testSummary.successfulCount}/{build.testSummary.totalCount} tests</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {(!devInfo || (devInfo.branches.length === 0 && devInfo.pullRequests.length === 0 && devInfo.builds.length === 0)) && (
                                                prSummary ? (
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                                {prSummary.count} pull request{prSummary.count > 1 ? "s" : ""}
                                                            </span>
                                                            <Badge size="xs" className={
                                                                prSummary.state === "OPEN" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                                : prSummary.state === "MERGED" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                            }>{prSummary.state.toLowerCase()}</Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {formatRelativeDate(prSummary.lastUpdated)}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Detailed PR info unavailable from the dev-status API — check server logs.</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">No linked GitHub activity found for this issue.</p>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {openSection === "previous" && (
                                        <div className="space-y-4">
                                            {mockPreviousUpdates.map((update, idx) => {
                                                const colors = [
                                                    { border: "border-cyan-400 dark:border-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
                                                    { border: "border-blue-500 dark:border-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
                                                ];
                                                const color = colors[idx % colors.length];
                                                return (
                                                    <div key={idx} className={`border-l-4 ${color.border} ${color.bg} rounded-r pl-4 p-3 space-y-1`}>
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{formatRelativeDate(update.date)} Update</h4>
                                                        {update.recent_changes && <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">Changes: </span>{update.recent_changes}</p>}
                                                        {update.next_focus && <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">Next: </span>{update.next_focus}</p>}
                                                        {update.context && <p className="text-sm text-gray-600 dark:text-gray-400 italic">{update.context}</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {openSection === "comments" && (
                                        <div className="space-y-1">
                                            {/* Real Jira comments */}
                                            {card.jiraComments.length > 0 && (
                                                <>
                                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 pb-1">Jira</p>
                                                    {card.jiraComments.map((comment, idx) => (
                                                        <article key={comment.id} className={`p-4 text-sm bg-white dark:bg-gray-800 ${idx > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""}`}>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Avatar alt={comment.author.displayName} img="" placeholderInitials={getInitials(comment.author.displayName)} rounded size="xs" />
                                                                <span className="font-semibold text-gray-900 dark:text-white">{comment.author.displayName}</span>
                                                                <time className="text-xs text-gray-500">{formatDate(comment.created)}</time>
                                                                <Badge size="xs" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">jira</Badge>
                                                            </div>
                                                            <p className="text-gray-500 dark:text-gray-400 whitespace-pre-line">{comment.body}</p>
                                                        </article>
                                                    ))}
                                                </>
                                            )}
                                            {/* Mock Workstream DB comments */}
                                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 pt-2 pb-1">Workstream</p>
                                            {mockDbComments.map((comment, idx) => (
                                                <article key={comment.id} className={`p-4 text-sm bg-white dark:bg-gray-800 ${idx > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Avatar alt={comment.author} img="" placeholderInitials={getInitials(comment.author)} rounded size="xs" />
                                                        <span className="font-semibold text-gray-900 dark:text-white">{comment.author}</span>
                                                        <time className="text-xs text-gray-500">{formatDate(comment.created_at)}</time>
                                                        <Badge size="xs" className={
                                                            comment.type === "decision" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                                                : comment.type === "context" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                        }>{comment.type}</Badge>
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400">{comment.body}</p>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}
            </section>
        </div>
    );
}

CardBuilder.useLayout = false;
