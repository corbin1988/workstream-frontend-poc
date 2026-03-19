import type { NextApiRequest, NextApiResponse } from "next";
import { getJiraAuth } from "../../lib/jiraAuth";

export type JiraProject = {
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    style?: string;
    isPrivate?: boolean;
    avatarUrls?: Record<string, string>;
};

export async function fetchAllProjects(
    headers: Record<string, string>,
    baseUrl: string
): Promise<JiraProject[]> {
    const all: JiraProject[] = [];
    let startAt = 0;
    const maxResults = 50;

    while (true) {
        const res = await fetch(
            `${baseUrl}/project/search?startAt=${startAt}&maxResults=${maxResults}`,
            { headers }
        );
        if (!res.ok) break;
        const data = await res.json();
        const values: JiraProject[] = data.values ?? [];
        all.push(...values);
        if (all.length >= (data.total ?? 0) || values.length === 0) break;
        startAt += values.length;
    }

    return all;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const auth = getJiraAuth();
    if (!auth) return res.status(500).json({ error: "Jira credentials not configured" });

    try {
        const projects = await fetchAllProjects(auth.headers, auth.baseUrl);
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ projects });
    } catch {
        return res.status(500).json({ error: "Failed to fetch projects" });
    }
}
