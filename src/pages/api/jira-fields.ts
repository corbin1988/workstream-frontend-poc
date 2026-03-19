import type { NextApiRequest, NextApiResponse } from "next";
import { getJiraAuth } from "../../lib/jiraAuth";

export type JiraField = {
    id: string;
    name: string;
    custom: boolean;
    orderable: boolean;
    navigable: boolean;
    searchable: boolean;
    clauseNames: string[];
    schema?: {
        type: string;
        system?: string;
        custom?: string;
        customId?: number;
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const auth = getJiraAuth();
    if (!auth) return res.status(500).json({ error: "Jira credentials not configured" });

    try {
        const apiRes = await fetch(`${auth.baseUrl}/field`, { headers: auth.headers });
        if (!apiRes.ok) return res.status(apiRes.status).json({ error: "Failed to fetch fields" });
        const data: JiraField[] = await apiRes.json();
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ fields: Array.isArray(data) ? data : [] });
    } catch {
        return res.status(500).json({ error: "Failed to fetch fields" });
    }
}
