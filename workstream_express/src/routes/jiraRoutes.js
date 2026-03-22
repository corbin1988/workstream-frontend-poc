'use strict';

const { Router } = require('express');
const { searchIssues, getCreds, getIssues, getProjects, ping, getDevInfo, getIssueTypes, getFields, getStatuses, saveMapping } = require('../controllers/jiraController');

const router = Router();

// GET /api/jira/search?jql=...&maxResults=50
router.get('/search', searchIssues);

// GET /api/jira/creds
router.get('/creds', getCreds);

// GET /api/jira/issues?maxResults=50&startAt=0
router.get('/issues', getIssues);

// GET /api/jira/projects
router.get('/projects', getProjects);

// GET /api/jira/ping
router.get('/ping', ping);

// GET /api/jira/devinfo?issueId=...
router.get('/devinfo', getDevInfo);

// GET /api/jira/issue-types
router.get('/issue-types', getIssueTypes);

// GET /api/jira/fields
router.get('/fields', getFields);

// GET /api/jira/statuses
router.get('/statuses', getStatuses);

// POST /api/jira/mappings
router.post('/mappings', saveMapping);

module.exports = router;
