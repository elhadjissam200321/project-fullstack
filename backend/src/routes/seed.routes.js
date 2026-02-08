const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seed.controller');
const { authenticate, requireOrganisateur, requireSuperAdmin } = require('../middleware/auth');

// All seed routes require authentication and organisateur role
router.post('/events', authenticate, requireOrganisateur, seedController.seedEvents);
// Public route to seed initial users
router.post('/users', seedController.seedUsers);
router.delete('/clear', authenticate, requireOrganisateur, seedController.clearData);

// Super Admin Global Routes
router.post('/global-seed', authenticate, requireSuperAdmin, seedController.seedAllData);
router.delete('/global-clear', authenticate, requireSuperAdmin, seedController.clearAllData);

module.exports = router;
