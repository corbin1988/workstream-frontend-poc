const { convert } = require('adf-to-md');

function getAuthHeaders(email, token) {
    const base64 = Buffer.from(`${email}:${token}`).toString('base64');
    return {
        Authorization: `Basic ${base64}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
}

function flattenAdf(data) {
    if (!data.issues) return;
    for (const issue of data.issues) {
        if (issue.fields?.description && typeof issue.fields.description === 'object') {
            issue.fields.description = convert(issue.fields.description).result.trim();
        }
        if (Array.isArray(issue.fields?.comment?.comments)) {
            for (const c of issue.fields.comment.comments) {
                if (c.body && typeof c.body === 'object') {
                    c.body = convert(c.body).result.trim();
                }
            }
        }
    }
}

function getJiraConfig() {
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const domain = process.env.JIRA_DOMAIN;
    if (!email || !token || !domain) return null;
    return { email, token, domain };
}

module.exports = { getAuthHeaders, flattenAdf, getJiraConfig };
