import type { NextApiRequest, NextApiResponse } from "next";
import { getJiraAuth } from "../../lib/jiraAuth";

export type DevBranch = {
    name: string;
    url: string;
    createDate: string;
    repository: { name: string; url: string };
    lastCommit: {
        id: string;
        shortId: string;
        message: string;
        authorTimestamp: string;
        url: string;
        author: { name: string };
        fileCount: number;
        additions: number;
        deletions: number;
    };
};

export type DevPullRequest = {
    id: string;
    title: string;
    url: string;
    status: "OPEN" | "MERGED" | "DECLINED";
    sourceBranch: string;
    destinationBranch: string;
    lastUpdate: string;
    author: { name: string; url: string; avatar: string };
    reviewers: { name: string; approvalStatus: string }[];
    commentCount: number;
};

export type DevBuild = {
    id: string;
    buildNumber: string;
    name: string;
    url: string;
    state: "successful" | "failed" | "in_progress" | "unknown";
    createdAt: string;
    testSummary?: { totalCount: number; failedCount: number; skippedCount: number; successfulCount: number };
};

export type DevInfoResponse = {
    branches: DevBranch[];
    pullRequests: DevPullRequest[];
    builds: DevBuild[];
    error?: string;
};

async function fetchDevDetail(
    domain: string,
    headers: Record<string, string>,
    issueId: string,
    dataType: "branch" | "pullrequest" | "build"
): Promise<any[]> {
    const url = `https://${domain}/rest/dev-status/1.0/issue/detail?issueId=${issueId}&applicationType=github&dataType=${dataType}`;
    try {
        const res = await fetch(url, { headers });
        console.log(`[devinfo] ${dataType} status=${res.status} url=${url}`);
        if (!res.ok) {
            const errText = await res.text();
            console.log(`[devinfo] ${dataType} error body:`, errText.slice(0, 300));
            return [];
        }
        const data = await res.json();
        console.log(`[devinfo] ${dataType} raw detail count=${data.detail?.length ?? 0}`, JSON.stringify(data).slice(0, 500));
        const items: any[] = [];
        for (const detail of data.detail ?? []) {
            if (dataType === "branch") items.push(...(detail.branches ?? []));
            else if (dataType === "pullrequest") items.push(...(detail.pullRequests ?? []));
            else if (dataType === "build") items.push(...(detail.buildOverviews ?? detail.builds ?? []));
        }
        console.log(`[devinfo] ${dataType} found ${items.length} items`);
        return items;
    } catch (e) {
        console.error(`[devinfo] ${dataType} exception:`, e);
        return [];
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<DevInfoResponse>) {
    const auth = getJiraAuth();
    if (!auth) return res.status(500).json({ branches: [], pullRequests: [], builds: [], error: "Jira credentials not configured" });

    const issueId = req.query.issueId as string;
    if (!issueId) return res.status(400).json({ branches: [], pullRequests: [], builds: [], error: "issueId required" });

    const domain = process.env.JIRA_DOMAIN!;

    const [branches, pullRequests, builds] = await Promise.all([
        fetchDevDetail(domain, auth.headers, issueId, "branch"),
        fetchDevDetail(domain, auth.headers, issueId, "pullrequest"),
        fetchDevDetail(domain, auth.headers, issueId, "build"),
    ]);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ branches, pullRequests, builds });
}
