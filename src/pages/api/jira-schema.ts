import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const domain = process.env.JIRA_DOMAIN;

    if (!email || !token || !domain) {
        return res.status(500).json({ error: "Jira credentials not configured" });
    }

    const base64 = Buffer.from(`${email}:${token}`).toString("base64");
    const headers = {
        Authorization: `Basic ${base64}`,
        Accept: "application/json",
    };
    const baseUrl = `https://${domain}/rest/api/3`;

    const [projectsRes, fieldsRes, statusesRes, prioritiesRes] = await Promise.all([
        fetch(`${baseUrl}/project/search?maxResults=100`, { headers }),
        fetch(`${baseUrl}/field`, { headers }),
        fetch(`${baseUrl}/status`, { headers }),
        fetch(`${baseUrl}/priority`, { headers }),
    ]);

    const [projects, fields, statuses, priorities] = await Promise.all([
        projectsRes.json(),
        fieldsRes.json(),
        statusesRes.json(),
        prioritiesRes.json(),
    ]);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
        projects: projects.values ?? [],
        fields: Array.isArray(fields) ? fields : [],
        statuses: Array.isArray(statuses) ? statuses : [],
        priorities: Array.isArray(priorities) ? priorities : [],
    });
}
