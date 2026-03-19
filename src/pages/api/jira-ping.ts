import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const domain = process.env.JIRA_DOMAIN;

    if (!email || !token || !domain) {
        return res.status(500).json({ error: "Jira credentials not configured in .env.local" });
    }

    const base64 = Buffer.from(`${email}:${token}`).toString("base64");

    try {
        const jiraRes = await fetch(`https://${domain}/rest/api/3/serverInfo`, {
            headers: {
                Authorization: `Basic ${base64}`,
                Accept: "application/json",
            },
        });

        const data = await jiraRes.json();

        if (!jiraRes.ok) {
            return res.status(jiraRes.status).json({ error: data?.message ?? "Jira returned an error", status: jiraRes.status });
        }

        return res.status(200).json(data);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? "Failed to reach Jira" });
    }
}
