const Registration = require('../models/Registration');
const Event = require('../models/Event');
const database = require('../config/database');

/**
 * Get all registrations (organisateur only)
 */
async function getAllRegistrations(req, res) {
    try {
        const { limit, offset } = req.query;
        const registrations = await Registration.findAll(database, {
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
        });

        res.json({ registrations });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
}

/**
 * Get registrations for a specific event
 */
async function getEventRegistrations(req, res) {
    try {
        const { eventId } = req.params;

        // Check if event exists
        const event = await Event.findById(database, eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const registrations = await Registration.findByEventId(database, eventId);

        res.json({ registrations });
    } catch (error) {
        console.error('Get event registrations error:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
}

/**
 * Get all registrations for an organiser's events
 */
async function getOrganiserRegistrations(req, res) {
    try {
        const userId = req.user.id;
        const registrations = await Registration.findByOrganiser(database, userId);
        res.json({ registrations });
    } catch (error) {
        console.error('Get organiser registrations error:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
}

/**
 * Check if current user is registered for an event
 */
async function checkUserRegistration(req, res) {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const userEmail = req.user.email;

        // Find registration by event_id and email
        const registration = await database.get(
            'SELECT * FROM registrations WHERE event_id = ? AND email = ?',
            [eventId, userEmail]
        );

        res.json({
            isRegistered: !!registration,
            registration: registration || null
        });
    } catch (error) {
        console.error('Check registration error:', error);
        res.status(500).json({ error: 'Failed to check registration' });
    }
}

/**
 * Create new registration
 */
async function createRegistration(req, res) {
    try {
        const { eventId, firstName, lastName, email, phone } = req.body;

        // If user is authenticated, use their info as priority/default
        let regFirstName = firstName;
        let regLastName = lastName;
        let regEmail = email;

        if (req.user) {
            regEmail = req.user.email;
            // Split full name if available
            if (req.user.fullName && (!regFirstName || !regLastName)) {
                const parts = req.user.fullName.split(' ');
                regFirstName = regFirstName || parts[0];
                regLastName = regLastName || (parts.length > 1 ? parts.slice(1).join(' ') : ' ');
            }
        }

        // Validate input
        if (!eventId || !regFirstName || !regLastName || !regEmail) {
            return res.status(400).json({ error: 'Event ID, name, and email are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(regEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if event exists
        const event = await Event.findById(database, eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if event is full
        const currentRegistrations = await Registration.countByEventId(database, eventId);
        if (currentRegistrations >= event.capacity) {
            return res.status(400).json({ error: 'Event is full' });
        }

        // Check if already registered
        const existing = await database.get(
            'SELECT id FROM registrations WHERE event_id = ? AND email = ?',
            [eventId, regEmail]
        );

        if (existing) {
            return res.status(409).json({ error: 'Email already registered for this event' });
        }

        const registrationId = await Registration.create(database, {
            eventId,
            firstName: regFirstName,
            lastName: regLastName,
            email: regEmail,
            phone,
            status: 'confirmed'
        });

        const registration = await Registration.findById(database, registrationId);

        res.status(201).json({ registration });
    } catch (error) {
        console.error('Create registration error:', error);

        if (error.message && (error.message.includes('fetch failed') || error.message.includes('timeout'))) {
            return res.status(503).json({
                error: 'La base de données est injoignable (Timeout). Votre inscription n\'a pas pu être enregistrée. Veuillez vérifier votre connexion.'
            });
        }

        res.status(500).json({ error: 'Failed to create registration' });
    }
}

/**
 * Update registration
 */
async function updateRegistration(req, res) {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, status } = req.body;

        // Check if registration exists
        const registration = await Registration.findById(database, id);
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        await Registration.update(database, id, {
            firstName,
            lastName,
            email,
            phone,
            status
        });

        const updatedRegistration = await Registration.findById(database, id);

        res.json({ registration: updatedRegistration });
    } catch (error) {
        console.error('Update registration error:', error);
        res.status(500).json({ error: 'Failed to update registration' });
    }
}

/**
 * Delete registration
 */
async function deleteRegistration(req, res) {
    try {
        const { id } = req.params;

        // Check if registration exists
        const registration = await Registration.findById(database, id);
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        // Allow if organisateur OR if the registration belongs to the user
        if (req.user.role !== 'organisateur' && registration.email !== req.user.email) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own registrations.' });
        }

        await Registration.delete(database, id);

        res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error('Delete registration error:', error);
        res.status(500).json({ error: 'Failed to delete registration' });
    }
}

module.exports = {
    getAllRegistrations,
    getEventRegistrations,
    getOrganiserRegistrations,
    checkUserRegistration,
    createRegistration,
    updateRegistration,
    deleteRegistration
};
