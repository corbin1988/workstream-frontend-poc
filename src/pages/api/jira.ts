import type { NextApiRequest, NextApiResponse } from "next";
import { convert } from "adf-to-md";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const domain = process.env.JIRA_DOMAIN;


    if (!email || !token || !domain) {
        console.error("[jira] Missing env vars:", { email: !!email, token: !!token, domain: !!domain });
        return res.status(500).json({ error: "Jira credentials not configured" });
    }

    const base64 = Buffer.from(`${email}:${token}`).toString("base64");

    const jql = (req.query.jql as string) || "project=WORK";
    console.log("[jira] Fetching jql:", jql);

    const maxResults = parseInt((req.query.maxResults as string) || "50", 10);

    const jiraRes = await fetch(
        `https://${domain}/rest/api/3/search/jql?expand=renderedFields`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${base64}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jql,
                fields: ["*all"],
                maxResults,
            }),
        }
    );

    const data = await jiraRes.json();
    // Flatten ADF fields to plain text on each issue
    if (data.issues) {
        for (const issue of data.issues) {
            if (issue.fields?.description && typeof issue.fields.description === "object") {
                issue.fields.description = convert(issue.fields.description).result.trim();
            }
            if (Array.isArray(issue.fields?.comment?.comments)) {
                for (const c of issue.fields.comment.comments) {
                    if (c.body && typeof c.body === "object") {
                        c.body = convert(c.body).result.trim();
                    }
                }
            }
        }
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(jiraRes.status).json(data);
}
