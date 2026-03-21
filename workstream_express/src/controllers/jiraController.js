'use strict';

const { getAuthHeaders, flattenAdf, getJiraConfig } = require('../utils/utils');

async function getIssues(req, res) {
    const config = getJiraConfig();
    if (!config) return res.status(500).json({ error: 'Jira credentials not configured' });
    const { email, token, domain } = config;

    const maxResults = parseInt(req.query.maxResults || '50', 10);
    const project = req.query.project ? `project = "${req.query.project}" AND ` : '';
    const jql = `${project}updated >= -30d ORDER BY updated DESC`;

    const jiraRes = await fetch(
        `https://${domain}/rest/api/3/search/jql?expand=renderedFields`,
        {
            method: 'POST',
            headers: getAuthHeaders(email, token),
            body: JSON.stringify({
                jql,
                fields: ['*all'],
                maxResults,
            }),
        }
    );

    const data = await jiraRes.json();
    flattenAdf(data);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(jiraRes.status).json(data);
}

async function getProjects(req, res) {
    const config = getJiraConfig();
    if (!config) return res.status(500).json({ error: 'Jira credentials not configured' });
    const { email, token, domain } = config;

    const projRes = await fetch(`https://${domain}/rest/api/3/project/search`, {
        headers: getAuthHeaders(email, token),
    });

    const data = await projRes.json();
    return res.status(projRes.status).json(data);
}

module.exports = { getIssues, getProjects };

