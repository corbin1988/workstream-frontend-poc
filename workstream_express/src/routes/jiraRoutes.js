'use strict';

const { Router } = require('express');
const { searchIssues, getCreds, getIssues, getProjects } = require('../controllers/jiraController');

const router = Router();

// GET /api/jira/search?jql=...&maxResults=50
router.get('/search', searchIssues);

// GET /api/jira/creds
router.get('/creds', getCreds);

// GET /api/jira/issues?maxResults=50&startAt=0
router.get('/issues', getIssues);

// GET /api/jira/projects
router.get('/projects', getProjects);

module.exports = router;
