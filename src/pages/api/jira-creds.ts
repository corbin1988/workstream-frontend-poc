import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
        email: process.env.JIRA_EMAIL ?? "",
        token: process.env.JIRA_API_TOKEN ?? "",
        domain: process.env.JIRA_DOMAIN ?? "",
    });
}
