class Stats {
    static async getDashboardOverview(database, userId) {
        const now = new Date().toISOString();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString();

        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM events WHERE created_by = ?) as total_events,
                (SELECT COUNT(DISTINCT email) FROM registrations WHERE event_id IN (SELECT id FROM events WHERE created_by = ?)) as total_participants,
                (SELECT COUNT(*) FROM events WHERE created_by = ? AND event_date >= ?) as upcoming_events
        `;

        const row = await database.get(sql, [userId, userId, userId, now]);
        return {
            total_events: row?.total_events ?? 0,
            total_participants: row?.total_participants ?? 0,
            upcoming_events: row?.upcoming_events ?? 0
        };
    }

    static async getParticipationTrend(database, userId, days = 7) {
        const trend = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setUTCHours(0, 0, 0, 0); // Use UTC midnight
            const dateStr = date.toISOString().split('T')[0];

            const nextDate = new Date(date);
            nextDate.setUTCDate(nextDate.getUTCDate() + 1);
            const nextDateStr = nextDate.toISOString();
            const currentDateStr = date.toISOString();

            const sql = `
                SELECT COUNT(*) as count 
                FROM registrations 
                WHERE created_at >= ? AND created_at < ?
                AND event_id IN (SELECT id FROM events WHERE created_by = ?)
            `;

            const result = await database.get(sql, [currentDateStr, nextDateStr, userId]);
            trend.push({
                date: dateStr,
                count: result.count || 0
            });
        }
        return trend;
    }

    static async getRecentActivity(database, userId, limit = 5) {
        const sql = `
            SELECT 
                r.id, r.event_id, r.email, r.phone, r.status,
                r.created_at as registered_at,
                e.title as event_title,
                COALESCE(p.full_name, (r.first_name || ' ' || r.last_name)) as full_name,
                p.avatar_url
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN users u ON r.email = u.email
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE e.created_by = ?
            ORDER BY r.created_at DESC
            LIMIT ?
        `;
        return database.all(sql, [userId, limit]);
    }
}

module.exports = Stats;
