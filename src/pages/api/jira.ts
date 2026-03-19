import type { NextApiRequest, NextApiResponse } from "next";

// Recursively extract plain text from Jira's Atlassian Document Format (ADF)
function adfToText(node: any): string {
    if (!node) return "";
    if (node.type === "text") return node.text ?? "";
    if (node.type === "hardBreak") return "\n";
    if (Array.isArray(node.content)) {
        const text = node.content.map(adfToText).join("");
        if (["paragraph", "heading", "codeBlock", "blockquote", "listItem", "bulletList", "orderedList", "rule"].includes(node.type)) {
            return text + "\n";
        }
        return text;
    }
    return "";
}

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
            }),
        }
    );

    const data = await jiraRes.json();
    // Flatten ADF description to plain text on each issue
    if (data.issues) {
        for (const issue of data.issues) {
            if (issue.fields?.description) {
                issue.fields.description = adfToText(issue.fields.description).trim();
            }
        }
    }
    res.setHeader("Cache-Control", "no-store");
    return res.status(jiraRes.status).json(data);
}
