'use strict';

const { Router } = require('express');
const { getIssues, getProjects } = require('../controllers/jiraController');

const router = Router();

// GET /api/jira/issues?maxResults=50&startAt=0
router.get('/issues', getIssues);

// GET /api/jira/projects
router.get('/projects', getProjects);

module.exports = router;
