import type { NextApiRequest, NextApiResponse } from "next";
import { getJiraAuth } from "../../lib/jiraAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const auth = getJiraAuth();
    if (!auth) return res.status(500).json({ error: "Jira credentials not configured" });

    const projectKey = req.query.projectKey as string | undefined;
    const url = projectKey
        ? `${auth.baseUrl}/issue/createmeta?expand=projects.issuetypes.fields&projectKeys=${encodeURIComponent(projectKey)}`
        : `${auth.baseUrl}/issue/createmeta?expand=projects.issuetypes.fields`;

    try {
        const apiRes = await fetch(url, { headers: auth.headers });
        if (!apiRes.ok) return res.status(apiRes.status).json({ error: "Failed to fetch create meta" });
        const data = await apiRes.json();
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json(data);
    } catch {
        return res.status(500).json({ error: "Failed to fetch create meta" });
    }
}
