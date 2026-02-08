const express = require('express');
const router = express.Router();
const registrationsController = require('../controllers/registrations.controller');
const { authenticate, requireOrganisateur } = require('../middleware/auth');

// Public routes
router.post('/', registrationsController.createRegistration);
router.get('/event/:eventId', registrationsController.getEventRegistrations);

// Protected routes (any authenticated user)
router.get('/check/:eventId', authenticate, registrationsController.checkUserRegistration);
router.delete('/:id', authenticate, registrationsController.deleteRegistration);

// Protected routes (organisateur only)
router.get('/', authenticate, requireOrganisateur, registrationsController.getAllRegistrations);
router.get('/organiser', authenticate, requireOrganisateur, registrationsController.getOrganiserRegistrations);
router.put('/:id', authenticate, requireOrganisateur, registrationsController.updateRegistration);

module.exports = router;
