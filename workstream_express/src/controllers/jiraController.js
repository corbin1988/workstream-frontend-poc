'use strict';

const { getAuthHeaders, flattenAdf, getJiraConfig } = require('../utils/utils');
const { getMapping } = require('../repositories/mappingRepository');
const { WorkItemMapping } = require('../models/WorkItemMapping');

const TENANT_ID = '1';

// GET /api/jira/search?jql=...&maxResults=50
async function searchIssues(req, res) {
    const config = getJiraConfig();
    if (!config) return res.status(500).json({ error: 'Jira credentials not configured' });
    const { email, token, domain } = config;

    const projectKey = req.query.projectKey ? String(req.query.projectKey) : null;
    if (!projectKey) return res.status(400).json({ error: 'projectKey query param is required' });

    const mapping = await WorkItemMapping.findOne({ tenant_id: BigInt(TENANT_ID), provider: 'jira', project_key: projectKey }).lean();
    if (!mapping) return res.status(404).json({ error: `No Jira mapping found for project ${projectKey}` });
    console.log('\x1b[31m[searchIssues] projectKey from mapping:', mapping.project_key, '\x1b[0m');

    const jql = req.query.jql
        ? String(req.query.jql).replace(/project\s*=\s*["']?[A-Z0-9_-]+["']?/i, `project = "${projectKey}"`)
        : `project = "${projectKey}" ORDER BY updated DESC`;
    const maxResults = parseInt(req.query.maxResults || '50', 10);

    const jiraRes = await fetch(
        `https://${domain}/rest/api/3/search/jql?expand=renderedFields`,
        {
            method: 'POST',
            headers: getAuthHeaders(email, token),
            body: JSON.stringify({ jql, fields: ['*all'], maxResults }),
        }
    );


    const data = await jiraRes.json();
    flattenAdf(data);

    if (Array.isArray(data.issues)) {
        console.log(`[searchIssues] getMapping(${TENANT_ID}, jira, ${projectKey}) →`, `found, issue_types: ${JSON.stringify(mapping.issue_types)}`);

        if (Array.isArray(mapping.issue_types) && mapping.issue_types.length > 0) {
            const allowedTypes = new Set(mapping.issue_types.map(t => t.name.toLowerCase()));
            console.log('[searchIssues] allowedTypes:', [...allowedTypes]);
            console.log('[searchIssues] issues before filter:', data.issues.map(i => `${i.key} (${i.fields?.issuetype?.name})`));
            data.issues = data.issues.filter(issue => {
                const typeName = issue.fields?.issuetype?.name ?? '';
                return allowedTypes.has(typeName.toLowerCase());
            });
            data.total = data.issues.length;
            console.log('[searchIssues] issues after filter:', data.issues.map(i => i.key));
        }
    }

    res.setHeader('Cache-Control', 'no-store');
    // console.log('[searchIssues]', JSON.stringify(data, null, 2));
    // console.log("HITT")
    return res.status(jiraRes.status).json(data);
}

// GET /api/jira/creds
function getCreds(req, res) {
    const config = getJiraConfig();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
        email: config?.email ?? '',
        token: config?.token ?? '',
        domain: config?.domain ?? '',
    });
}

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

    const all = [];
    let startAt = 0;
    const maxResults = 50;

    while (true) {
        const projRes = await fetch(
            `https://${domain}/rest/api/3/project/search?startAt=${startAt}&maxResults=${maxResults}`,
            { headers: getAuthHeaders(email, token) }
        );
        if (!projRes.ok) return res.status(projRes.status).json({ error: 'Failed to fetch projects' });
        const data = await projRes.json();
        const values = data.values ?? [];
        all.push(...values);
        if (all.length >= (data.total ?? 0) || values.length === 0) break;
        startAt += values.length;
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ projects: all });
}

async function ping(req, res) {
    const config = getJiraConfig();
    if (!config) return res.status(500).json({ error: 'Jira credentials not configured' });
    const { email, token, domain } = config;

    try {
        const jiraRes = await fetch(`https://${domain}/rest/api/3/serverInfo`, {
            headers: getAuthHeaders(email, token),
        });
        const data = await jiraRes.json();
        if (!jiraRes.ok) return res.status(jiraRes.status).json({ error: data?.message ?? 'Jira returned an error' });
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err?.message ?? 'Failed to reach Jira' });
    }
}

async function getDevInfo(req, res) {
    const config = getJiraConfig();
    if (!config) return res.status(500).json({ branches: [], pullRequests: [], builds: [], error: 'Jira credentials not configured' });
    const { email, token, domain } = config;

    const issueId = req.query.issueId;
    if (!issueId) return res.status(400).json({ branches: [], pullRequests: [], builds: [], error: 'issueId required' });

    const headers = getAuthHeaders(email, token);

    async function fetchDetail(dataType) {
        const url = `https://${domain}/rest/dev-status/1.0/issue/detail?issueId=${issueId}&applicationType=github&dataType=${dataType}`;
        try {
            const r = await fetch(url, { headers });
            if (!r.ok) return [];
            const data = await r.json();
            const items = [];
            for (const detail of data.detail ?? []) {
                if (dataType === 'branch') items.push(...(detail.branches ?? []));
                else if (dataType === 'pullrequest') items.push(...(detail.pullRequests ?? []));
                else if (dataType === 'build') items.push(...(detail.buildOverviews ?? detail.builds ?? []));
            }
            return items;
        } catch {
            return [];
        }
    }

    const [branches, pullRequests, builds] = await Promise.all([
        fetchDetail('branch'),
        fetchDetail('pullrequest'),
        fetchDetail('build'),
    ]);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ branches, pullRequests, builds });
}

async function getIssueTypes(req, res) {
    const config = getJiraConfig();
    if (!config) return res.status(500).json({ error: 'Jira credentials not configured' });
    const { email, token, domain } = config;

    try {
        const apiRes = await fetch(`https://${domain}/rest/api/3/issuetype`, {
            headers: getAuthHeaders(email, token),
        });
        if (!apiRes.ok) return res.status(apiRes.status).json({ error: 'Failed to fetch issue types' });
        const data = await apiRes.json();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ issueTypes: Array.isArray(data) ? data : [] });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch issue types' });
    }
}

async function getFields(req, res) {
    const config = getJiraConfig();
    if (!config) return res.status(500).json({ error: 'Jira credentials not configured' });
    const { email, token, domain } = config;

    try {
        const apiRes = await fetch(`https://${domain}/rest/api/3/field`, {
            headers: getAuthHeaders(email, token),
        });
        if (!apiRes.ok) return res.status(apiRes.status).json({ error: 'Failed to fetch fields' });
        const data = await apiRes.json();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ fields: Array.isArray(data) ? data : [] });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch fields' });
    }
}

async function getStatuses(req, res) {
    const config = getJiraConfig();
    if (!config) return res.status(500).json({ error: 'Jira credentials not configured' });
    const { email, token, domain } = config;

    try {
        const apiRes = await fetch(`https://${domain}/rest/api/3/status`, {
            headers: getAuthHeaders(email, token),
        });
        if (!apiRes.ok) return res.status(apiRes.status).json({ error: 'Failed to fetch statuses' });
        const data = await apiRes.json();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ statuses: Array.isArray(data) ? data : [] });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch statuses' });
    }
}

// POST /api/jira/mappings
async function saveMapping(req, res) {
    const { provider, project_key, project_name, issue_types, field_mapping, status_mapping } = req.body;

    if (!project_key) {
        return res.status(400).json({ error: 'project_key is required' });
    }

    try {
        const doc = await WorkItemMapping.findOneAndUpdate(
            {
                tenant_id: BigInt(TENANT_ID),
                provider: provider ?? 'jira',
                project_key,
            },
            {
                $set: {
                    project_name: project_name ?? '',
                    issue_types: issue_types ?? [],
                    title:       field_mapping?.title       ?? 'summary',
                    description: field_mapping?.description ?? 'description',
                    status:      field_mapping?.status      ?? 'status',
                    priority:    field_mapping?.priority    ?? 'priority',
                    due_date:    field_mapping?.due_date    ?? 'duedate',
                    status_mapping: {
                        'To Do':       status_mapping?.['To Do']       ?? [],
                        'In Progress': status_mapping?.['In Progress'] ?? [],
                        'Done':        status_mapping?.['Done']        ?? [],
                        'Blocked':     status_mapping?.['Blocked']     ?? [],
                    },
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({ ok: true, id: doc._id });
    } catch (err) {
        console.error('[saveMapping]', err);
        return res.status(500).json({ error: err?.message ?? 'Failed to save mapping' });
    }
}

module.exports = { searchIssues, getCreds, getIssues, getProjects, ping, getDevInfo, getIssueTypes, getFields, getStatuses, saveMapping };

