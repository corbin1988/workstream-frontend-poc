export type JiraAuthConfig = {
    headers: Record<string, string>;
    baseUrl: string;
};

export function getJiraAuth(): JiraAuthConfig | null {
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const domain = process.env.JIRA_DOMAIN;

    if (!email || !token || !domain) return null;

    const base64 = Buffer.from(`${email}:${token}`).toString("base64");
    return {
        headers: {
            Authorization: `Basic ${base64}`,
            Accept: "application/json",
        },
        baseUrl: `https://${domain}/rest/api/3`,
    };
}
