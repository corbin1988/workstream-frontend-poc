import { useState } from "react";
import { Avatar, Badge, Button, Card, Label, TextInput } from "flowbite-react";

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

const ticket = {
    issue_key: "WS-101",
    assignee: "Kyle Hurst",
    intent_frozen_at: "2026-03-19T10:00:00Z",
    status_category: "In Progress",
    title: "Build card builder UI",
    description: "Create a card builder component for displaying work items with git, PR, and standup data.",
    comments: [
        { id: 1, author: "Jane Doe", created_at: "2026-03-18T09:00:00Z", type: "context", body: "Looks great so far, keep going!" },
        { id: 2, author: "Alex Kim", created_at: "2026-03-18T11:30:00Z", type: "decision", body: "We agreed to use Flowbite components." },
    ],
    git: {
        branches: [
            {
                name: "feature/card-builder",
                last_commit_at: "2026-03-19T08:00:00Z",
                diff_summary: { files_changed: 4, insertions: 120, deletions: 30 },
                pr: {
                    id: 42,
                    state: "open",
                    comments: [
                        { id: 1, author: "Alex Kim", type: "review", body: "Please add unit tests for the helpers." },
                    ],
                },
            },
        ],
    },
};

const standupEntries = [
    {
        id: 1,
        linked_tickets: [{ issue_key: "WS-101" }],
        yesterday: "Worked on card layout\nFixed avatar alignment\nHooked up git branch display",
    },
];

const previousUpdates: { date: string; recent_changes: string; next_focus: string; context: string | null }[] = [
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

    const [apiURL, setApiURL] = useState<string>("");
    const [connStatus, setConnStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [connMessage, setConnMessage] = useState<string>("");

    const branch = ticket.git.branches[0];

    function toggle(section: string) {
        setOpenSection((prev) => (prev === section ? "" : section));
    }

    async function testConnection() {
        setConnStatus("loading");
        setConnMessage("");
        const email = process.env.NEXT_PUBLIC_JIRA_EMAIL;
        const token = process.env.NEXT_PUBLIC_JIRA_API_TOKEN;
        const basicAuth = btoa(`${email}:${token}`);
        try {
            const res = await fetch("/jira-proxy/rest/api/3/serverInfo", {
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    Accept: "application/json",
                },
            });
            const data = await res.json();
            if (res.ok) {
                setConnStatus("success");
                setConnMessage(`Connected! ${data.deploymentType === "Cloud" ? "Jira Cloud" : "Jira"} — ${data.serverTitle ?? ""} v${data.version ?? "?"}`);
            } else {
                setConnStatus("error");
                setConnMessage(`Failed ${res.status}: ${data.message ?? res.statusText}`);
            }
        } catch (err: any) {
            setConnStatus("error");
            setConnMessage(`Error: ${err?.message ?? "Could not reach server"}`);
        }
    }

    return (
        <div className="flex bg-gray-100 dark:bg-gray-900 p-6">
            <section className="w-3/8 p-6">
                <Card>
                    <div className="mb-2">
                        <Label htmlFor="api-url">Jira API URL</Label>
                    </div>
                    <TextInput
                        id="api-url"
                        type="url"
                        placeholder="https://myjira.jira.com"
                        value={apiURL}
                        onChange={(e) => setApiURL(e.target.value)}
                    />
                    <Button onClick={testConnection} isProcessing={connStatus === "loading"} disabled={!apiURL || connStatus === "loading"}>
                        Test Connection
                    </Button>
                    {connStatus !== "idle" && connStatus !== "loading" && (
                        <p className={`text-sm mt-2 ${connStatus === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {connMessage}
                        </p>
                    )}
                </Card>
            </section>
            <section className="w-5/8 p-6">
                <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">

                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <Avatar alt={ticket.assignee} img="" placeholderInitials={getInitials(ticket.assignee)} rounded size="md" className="shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{ticket.assignee}</span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500 text-sm">{formatTime(ticket.intent_frozen_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{ticket.issue_key}</span>
                                <Badge size="xs" className={
                                    ticket.status_category === "In Progress" ? "bg-yellow-900 text-yellow-300 border border-yellow-700"
                                        : ticket.status_category === "Done" ? "bg-green-900 text-green-300 border border-green-700"
                                            : "bg-gray-700 text-gray-300 border border-gray-600"
                                }>
                                    {ticket.status_category}
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
                    <div className="mt-3 ml-0 sm:ml-[52px] min-w-0">
                        {/* Git row */}
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 min-w-0">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="font-mono truncate">{branch.name}</span>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">{branch.diff_summary.files_changed} files</span>
                                <span className="text-green-600 dark:text-green-400 font-medium">+{branch.diff_summary.insertions}</span>
                                <span className="text-red-600 dark:text-red-400 font-medium">-{branch.diff_summary.deletions}</span>
                            </div>
                            {branch.pr && (
                                <>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-600 dark:text-gray-400">PR #{branch.pr.id}</span>
                                        <Badge size="xs" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">{branch.pr.state}</Badge>
                                    </div>
                                </>
                            )}
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-gray-500">Updated {formatRelativeDate(branch.last_commit_at)}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{ticket.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{ticket.description}</p>

                        {/* Standup */}
                        {standupEntries.filter((e) => e.linked_tickets.some((lt) => lt.issue_key === ticket.issue_key)).length > 0 && (
                            <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-gray-900/50 rounded-r p-3">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">What did you do since yesterday?</h4>
                                {standupEntries
                                    .filter((e) => e.linked_tickets.some((lt) => lt.issue_key === ticket.issue_key))
                                    .slice(0, 1)
                                    .map((entry) => (
                                        <ul key={entry.id} className="space-y-1">
                                            {entry.yesterday.split("\n").map((item, idx) => (
                                                <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm flex items-start">
                                                    <span className="mr-2">•</span><span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ))}
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between gap-2">
                                <button onClick={() => toggle("code")} className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${openSection === "code" ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"}`}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    Code {branch.pr && branch.pr.comments.length > 0 && <span className="text-gray-400">({branch.pr.comments.length})</span>}
                                </button>
                                <button onClick={() => toggle("previous")} className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${openSection === "previous" ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"}`}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                    {previousUpdates.length} previous
                                </button>
                                <button onClick={() => toggle("comments")} className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${openSection === "comments" ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"}`}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                                    {ticket.comments.length} comment{ticket.comments.length > 1 ? "s" : ""}
                                </button>
                            </div>

                            {openSection && (
                                <div className="mt-3">
                                    {openSection === "code" && (
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Code Activity</h5>
                                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                                                <span className="font-mono">{branch.name}</span>
                                                <span>{branch.diff_summary.files_changed} files</span>
                                                <span className="text-green-600 dark:text-green-400">+{branch.diff_summary.insertions}</span>
                                                <span className="text-red-600 dark:text-red-400">-{branch.diff_summary.deletions}</span>
                                                <span>Updated {formatDate(branch.last_commit_at)}</span>
                                            </div>
                                            {branch.pr && (
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">Pull Request #{branch.pr.id}</span>
                                                        <Badge color="warning" size="xs">{branch.pr.state}</Badge>
                                                    </div>
                                                    {branch.pr.comments.map((c) => (
                                                        <div key={c.id} className="text-xs mt-2">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-gray-700 dark:text-gray-300">{c.author}</span>
                                                                <Badge color={c.type === "review" ? "purple" : "green"} size="xs">{c.type}</Badge>
                                                            </div>
                                                            <p className="text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-gray-200 dark:border-gray-700">{c.body}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {openSection === "previous" && (
                                        <div className="space-y-4">
                                            {previousUpdates.map((update, idx) => {
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
                                        <div className="space-y-3">
                                            {ticket.comments.map((comment, idx) => (
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
            </section>
        </div>
    );
}

CardBuilder.useLayout = false;
