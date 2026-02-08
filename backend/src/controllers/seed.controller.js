const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { hashPassword } = require('../utils/password');
const database = require('../config/database');

// Import sample data
const { sampleEvents, sampleEventImages } = require('../data/sample-events');
const { sampleParticipants, getRandomParticipants } = require('../data/sample-participants');
const { sampleOrganisateurs, sampleParticipantsAccounts, defaultPassword } = require('../data/sample-accounts');


/**
 * Get a date N days ago at noon (for consistent created_at in trend range)
 */
function getDateDaysAgo(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
}

/**
 * Seed demo events with registrations spread over the last 7 days (for chart trend)
 */
async function seedEvents(req, res) {
    try {
        const userId = req.user.id;

        const createdEvents = [];
        let registrationsCreated = 0;

        for (const event of sampleEvents) {
            const eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + (event.daysFromNow || 0));

            const eventId = await Event.create(database, {
                title: event.title,
                description: event.description,
                location: event.location,
                category: event.category,
                capacity: event.capacity,
                eventDate: eventDate.toISOString(),
                imageUrl: sampleEventImages[event.image],
                createdBy: userId
            });

            // Spread registrations over the last 7 days so participation trend chart has data each day
            const participants = getRandomParticipants(50);
            let participantIndex = 0;
            for (let day = 6; day >= 0; day--) {
                const countThisDay = Math.floor(Math.random() * 4) + 2; // 2–5 per day
                for (let i = 0; i < countThisDay && participantIndex < participants.length; i++) {
                    const p = participants[participantIndex++];
                    await Registration.create(database, {
                        eventId,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        email: p.email,
                        phone: p.phone,
                        status: 'confirmed',
                        createdAt: getDateDaysAgo(day)
                    });
                    registrationsCreated++;
                }
            }

            createdEvents.push({ id: eventId, capacity: event.capacity });
        }

        res.json({
            message: `Created ${createdEvents.length} events and ${registrationsCreated} registrations`,
            eventsCount: createdEvents.length,
            registrationsCount: registrationsCreated
        });
    } catch (error) {
        console.error('Seed events error:', error);
        res.status(500).json({ error: 'Failed to seed events' });
    }
}

/**
 * Seed demo users
 */
async function seedUsers(req, res) {
    try {
        const passwordHash = await hashPassword(defaultPassword);
        let organisateursCreated = 0;
        let participantsCreated = 0;

        // Create organisateurs
        for (const org of sampleOrganisateurs) {
            try {
                const userId = await User.create(database, {
                    email: org.email,
                    passwordHash
                });

                await Profile.create(database, {
                    userId,
                    fullName: org.fullName,
                    role: 'organisateur'
                });

                organisateursCreated++;
            } catch (error) {
                // Skip if user already exists
                console.log(`User ${org.email} already exists`);
            }
        }

        // Create participants
        for (const part of sampleParticipantsAccounts) {
            try {
                const userId = await User.create(database, {
                    email: part.email,
                    passwordHash
                });

                await Profile.create(database, {
                    userId,
                    fullName: part.fullName,
                    role: 'participant'
                });

                participantsCreated++;
            } catch (error) {
                // Skip if user already exists
                console.log(`User ${part.email} already exists`);
            }
        }

        if (res && res.json) {
            res.json({
                message: `Created ${organisateursCreated} organisateurs and ${participantsCreated} participants`,
                organisateursCreated,
                participantsCreated,
                password: defaultPassword
            });
        }
    } catch (error) {
        console.error('Seed users error:', error);
        if (res && res.status) {
            res.status(500).json({ error: 'Failed to seed users' });
        }
    }
}

/**
 * Clear all data for current user
 */
async function clearData(req, res) {
    try {
        const userId = req.user.id;

        const events = await Event.findByOrganiser(database, userId);
        const eventIds = events.map(e => e.id);

        let deletedRegistrations = 0;
        for (const eventId of eventIds) {
            const regs = await database.all('SELECT id FROM registrations WHERE event_id = ?', [eventId]);
            deletedRegistrations += regs.length;
            await Registration.deleteByEventId(database, eventId);
        }

        await Event.deleteByOrganiser(database, userId);

        res.json({
            message: `Deleted all data for user ${userId}`,
            deletedEvents: eventIds.length,
            deletedRegistrations
        });
    } catch (error) {
        console.error('Clear data error:', error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
}

/**
 * Clear ALL data (Super Admin)
 */
async function clearAllData(req, res) {
    try {
        const events = await database.all('SELECT id FROM events');
        const eventIds = events.map(e => e.id);

        let deletedRegistrations = 0;
        for (const eventId of eventIds) {
            const regs = await database.all('SELECT id FROM registrations WHERE event_id = ?', [eventId]);
            deletedRegistrations += regs.length;
            await Registration.deleteByEventId(database, eventId);
        }

        await database.run('DELETE FROM events');

        res.json({
            message: `Deleted ALL data globally`,
            deletedEvents: eventIds.length,
            deletedRegistrations
        });
    } catch (error) {
        console.error('Clear all data error:', error);
        res.status(500).json({ error: 'Failed to clear all data' });
    }
}

/**
 * Seed GLOBAL data (Super Admin)
 * Creates events for all existing organizers
 */
async function seedAllData(req, res) {
    try {
        // Get all organizers
        const profiles = await database.all("SELECT user_id FROM profiles WHERE role = 'organisateur'");
        const organizerIds = profiles.map(p => p.user_id);

        if (organizerIds.length === 0) {
            // If no organizers, seed users first (including organizers)
            await seedUsers(req, {}); // Reuse logic but don't respond
            const newProfiles = await database.all("SELECT user_id FROM profiles WHERE role = 'organisateur'");
            organizerIds.push(...newProfiles.map(p => p.user_id));
        }

        let totalEvents = 0;
        let totalRegistrations = 0;

        for (const userId of organizerIds) {
            for (const event of sampleEvents) {
                const eventDate = new Date();
                const randomOffset = Math.floor(Math.random() * 5);
                eventDate.setDate(eventDate.getDate() + (event.daysFromNow || 0) + randomOffset);

                const eventId = await Event.create(database, {
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    category: event.category,
                    capacity: event.capacity,
                    eventDate: eventDate.toISOString(),
                    imageUrl: sampleEventImages[event.image],
                    createdBy: userId
                });

                const participants = getRandomParticipants(50);
                let participantIndex = 0;
                // reduced density for global seed
                for (let day = 3; day >= 0; day--) {
                    const countThisDay = Math.floor(Math.random() * 3) + 1;
                    for (let i = 0; i < countThisDay && participantIndex < participants.length; i++) {
                        const p = participants[participantIndex++];
                        await Registration.create(database, {
                            eventId,
                            firstName: p.firstName,
                            lastName: p.lastName,
                            email: p.email,
                            phone: p.phone,
                            status: 'confirmed',
                            createdAt: getDateDaysAgo(day)
                        });
                        totalRegistrations++;
                    }
                }
                totalEvents++;
            }
        }

        res.json({
            message: `Created global data: ${totalEvents} events, ${totalRegistrations} registrations across ${organizerIds.length} organizers.`,
            eventsCount: totalEvents,
            registrationsCount: totalRegistrations
        });

    } catch (error) {
        console.error('Seed all data error:', error);
        res.status(500).json({ error: 'Failed to seed global data' });
    }
}

module.exports = {
    seedEvents,
    seedUsers,
    clearData,
    clearAllData,
    seedAllData
};
