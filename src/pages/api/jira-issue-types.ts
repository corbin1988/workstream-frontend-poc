import type { NextApiRequest, NextApiResponse } from "next";
import { getJiraAuth } from "../../lib/jiraAuth";

export type JiraIssueType = {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    subtask: boolean;
    hierarchyLevel?: number;
    scope?: {
        type: "GLOBAL" | "PROJECT";
        project?: {
            id: string;
            key?: string;
            name?: string;
        };
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const auth = getJiraAuth();
    if (!auth) return res.status(500).json({ error: "Jira credentials not configured" });

    try {
        const apiRes = await fetch(`${auth.baseUrl}/issuetype`, { headers: auth.headers });
        if (!apiRes.ok) return res.status(apiRes.status).json({ error: "Failed to fetch issue types" });
        const data: JiraIssueType[] = await apiRes.json();
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ issueTypes: Array.isArray(data) ? data : [] });
    } catch {
        return res.status(500).json({ error: "Failed to fetch issue types" });
    }
}
