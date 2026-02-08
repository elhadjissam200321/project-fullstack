const Event = require('../models/Event');
const Registration = require('../models/Registration');
const database = require('../config/database');

// Get all events
async function getAllEvents(req, res) {
    try {
        const { limit, offset, upcoming } = req.query;
        const events = await Event.findAll(database, {
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
            upcoming: upcoming === 'true'
        });

        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const count = await Registration.countByEventId(database, event.id);
                return {
                    ...event,
                    registrationCount: count,
                    availableSpots: event.capacity - count
                };
            })
        );

        res.json({ events: eventsWithCounts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}

// Get single event by ID
async function getEventById(req, res) {
    try {
        const { id } = req.params;
        const event = await Event.findById(database, id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const registrationCount = await Registration.countByEventId(database, id);

        res.json({
            event: {
                ...event,
                registrationCount,
                availableSpots: event.capacity - registrationCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch event' });
    }
}

// Create new event
async function createEvent(req, res) {
    try {
        const { title, description, location, category, capacity, eventDate, event_date, imageUrl, image_url } = req.body;
        const finalEventDate = eventDate || event_date;
        const finalImageUrl = imageUrl || image_url;

        if (!title || !location || !capacity || !finalEventDate) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }

        const eventId = await Event.create(database, {
            title,
            description,
            location,
            category,
            capacity: parseInt(capacity),
            eventDate: finalEventDate,
            imageUrl: finalImageUrl,
            createdBy: req.user.id
        });

        // Optimization: Return essential data immediately to reduce latency on shared hosting
        res.status(201).json({
            event: {
                id: eventId,
                title,
                description,
                location,
                category,
                capacity: parseInt(capacity),
                event_date: finalEventDate,
                image_url: finalImageUrl,
                registrationCount: 0,
                availableSpots: parseInt(capacity)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
}

// Update event
async function updateEvent(req, res) {
    try {
        const { id } = req.params;
        const { title, description, location, category, capacity, eventDate, event_date, imageUrl, image_url } = req.body;
        const finalEventDate = eventDate || event_date;
        const finalImageUrl = imageUrl || image_url;

        const event = await Event.findById(database, id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Event.update(database, id, {
            title,
            description,
            location,
            category,
            capacity: capacity ? parseInt(capacity) : undefined,
            eventDate: finalEventDate,
            imageUrl: finalImageUrl
        });

        // Optimization: Return updated data directly to minimize latency
        res.json({
            event: {
                ...event,
                title: title || event.title,
                description: description !== undefined ? description : event.description,
                location: location || event.location,
                category: category || event.category,
                capacity: capacity ? parseInt(capacity) : event.capacity,
                event_date: finalEventDate || event.event_date,
                image_url: finalImageUrl !== undefined ? finalImageUrl : event.image_url
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update event' });
    }
}

// Delete event
async function deleteEvent(req, res) {
    try {
        const { id } = req.params;

        const event = await Event.findById(database, id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Registration.deleteByEventId(database, id);
        await Event.delete(database, id);

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
}

// Get events by organiser
async function getOrganiserEvents(req, res) {
    try {
        const events = await Event.findByOrganiser(database, req.user.id);

        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const count = await Registration.countByEventId(database, event.id);
                return {
                    ...event,
                    registrationCount: count,
                    availableSpots: event.capacity - count
                };
            })
        );

        res.json({ events: eventsWithCounts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getOrganiserEvents
};
