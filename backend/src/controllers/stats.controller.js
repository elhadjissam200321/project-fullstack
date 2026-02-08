const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Stats = require('../models/Stats');
const database = require('../config/database');

/**
 * Get dashboard statistics
 */
async function getDashboardStats(req, res) {
    try {
        const userId = req.user.id;
        const stats = await Stats.getDashboardOverview(database, userId);

        // Coerce to numbers as SQLite might return them as strings
        const totalEvents = Number(stats?.total_events ?? 0);
        const uniqueParticipants = Number(stats?.total_participants ?? 0);
        const upcomingEvents = Number(stats?.upcoming_events ?? 0);

        const trend = await Stats.getParticipationTrend(database, userId, 7);
        const sevenDayRegistrations = trend.reduce((sum, d) => sum + Number(d.count || 0), 0);

        res.json({
            stats: {
                totalEvents,
                uniqueParticipants,
                upcomingEvents,
                sevenDayRegistrations,
                participationTrend: trend.map(t => ({
                    date: t.date,
                    count: Number(t.count || 0)
                }))
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
}

/**
 * Get participation trend (last 7 days)
 */
async function getParticipationTrend(req, res) {
    try {
        const userId = req.user.id;
        const trend = await Stats.getParticipationTrend(database, userId, 7);
        res.json({ trend });
    } catch (error) {
        console.error('Get participation trend error:', error);
        res.status(500).json({ error: 'Failed to fetch trend' });
    }
}

/**
 * Get recent registrations activity
 */
async function getRecentActivity(req, res) {
    try {
        const userId = req.user.id;
        const activity = await Stats.getRecentActivity(database, userId, 5);
        res.json({ activity });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
}

/**
 * Get event-specific statistics
 */
async function getEventStats(req, res) {
    try {
        const { id } = req.params;

        // Check if event exists
        const event = await Event.findById(database, id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Get registrations
        const registrations = await Registration.findByEventId(database, id);
        const confirmedCount = registrations.filter(r => r.status === 'confirmed').length;

        res.json({
            stats: {
                totalRegistrations: registrations.length,
                confirmedRegistrations: confirmedCount,
                capacity: event.capacity,
                availableSpots: event.capacity - confirmedCount,
                utilizationRate: ((confirmedCount / event.capacity) * 100).toFixed(2)
            }
        });
    } catch (error) {
        console.error('Get event stats error:', error);
        res.status(500).json({ error: 'Failed to fetch event statistics' });
    }
}

module.exports = {
    getDashboardStats,
    getParticipationTrend,
    getRecentActivity,
    getEventStats
};
