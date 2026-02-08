const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticate, requireOrganisateur } = require('../middleware/auth');

// All stats routes require authentication and organisateur role
router.get('/dashboard', authenticate, requireOrganisateur, statsController.getDashboardStats);
router.get('/participation-trend', authenticate, requireOrganisateur, statsController.getParticipationTrend);
router.get('/recent-activity', authenticate, requireOrganisateur, statsController.getRecentActivity);
router.get('/events/:id', authenticate, requireOrganisateur, statsController.getEventStats);

module.exports = router;
