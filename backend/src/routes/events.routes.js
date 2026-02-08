const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const { authenticate, requireOrganisateur } = require('../middleware/auth');

// Public routes
router.get('/', eventsController.getAllEvents);
// More specific route first so /organiser/my-events is not matched as /:id
router.get('/organiser/my-events', authenticate, requireOrganisateur, eventsController.getOrganiserEvents);
router.get('/:id', eventsController.getEventById);

// Protected routes (organisateur only)
router.post('/', authenticate, requireOrganisateur, eventsController.createEvent);
router.put('/:id', authenticate, requireOrganisateur, eventsController.updateEvent);
router.delete('/:id', authenticate, requireOrganisateur, eventsController.deleteEvent);

module.exports = router;
