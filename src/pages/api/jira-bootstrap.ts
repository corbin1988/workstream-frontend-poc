import type { NextApiRequest, NextApiResponse } from "next";
import { getJiraAuth } from "../../lib/jiraAuth";
import { fetchAllProjects } from "./jira-projects";
import type { JiraIssueType } from "./jira-issue-types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const auth = getJiraAuth();
    if (!auth) return res.status(500).json({ error: "Jira credentials not configured" });

    const [projectsResult, issueTypesResult] = await Promise.allSettled([
        fetchAllProjects(auth.headers, auth.baseUrl),
        fetch(`${auth.baseUrl}/issuetype`, { headers: auth.headers }).then(
            (r) => r.json() as Promise<JiraIssueType[]>
        ),
    ]);

    const projects =
        projectsResult.status === "fulfilled" ? projectsResult.value : [];
    const issueTypes =
        issueTypesResult.status === "fulfilled" && Array.isArray(issueTypesResult.value)
            ? issueTypesResult.value
            : [];

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
        projects,
        issueTypes,
        errors: {
            projects: projectsResult.status === "rejected" ? String(projectsResult.reason) : null,
            issueTypes: issueTypesResult.status === "rejected" ? String(issueTypesResult.reason) : null,
        },
    });
}
