import type { NextApiRequest, NextApiResponse } from "next";
import { getJiraAuth } from "../../lib/jiraAuth";

export type JiraStatus = {
    id: string;
    name: string;
    statusCategory: {
        id: number;
        key: string;
        name: string;
        colorName: string;
    };
    scope?: { type: string; project?: { id: string } };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const auth = getJiraAuth();
    if (!auth) return res.status(500).json({ error: "Jira credentials not configured" });

    try {
        const apiRes = await fetch(`${auth.baseUrl}/status`, { headers: auth.headers });
        if (!apiRes.ok) return res.status(apiRes.status).json({ error: "Failed to fetch statuses" });
        const data: JiraStatus[] = await apiRes.json();
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ statuses: Array.isArray(data) ? data : [] });
    } catch {
        return res.status(500).json({ error: "Failed to fetch statuses" });
    }
}
