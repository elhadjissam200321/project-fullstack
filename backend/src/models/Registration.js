const { v4: uuidv4 } = require('uuid');

class Registration {
    static async create(database, { eventId, firstName, lastName, email, phone, status = 'confirmed', createdAt }) {
        const id = uuidv4();
        const sql = `INSERT INTO registrations (id, event_id, first_name, last_name, email, phone, status${createdAt ? ', created_at' : ''}) 
                     VALUES (?, ?, ?, ?, ?, ?, ?${createdAt ? ', ?' : ''})`;
        const params = [id, eventId, firstName, lastName, email, phone, status];
        if (createdAt) params.push(createdAt);

        await database.run(sql, params);
        return id;
    }

    static async findAll(database, { limit, offset } = {}) {
        let sql = 'SELECT * FROM registrations ORDER BY created_at DESC';
        const params = [];

        if (limit) {
            sql += ' LIMIT ?';
            params.push(limit);
        }

        if (offset) {
            sql += ' OFFSET ?';
            params.push(offset);
        }

        return await database.all(sql, params);
    }

    static async findById(database, id) {
        return await database.get(
            'SELECT * FROM registrations WHERE id = ?',
            [id]
        );
    }

    static async findByEventId(database, eventId) {
        return await database.all(
            `SELECT r.*, p.full_name, p.avatar_url 
             FROM registrations r
             LEFT JOIN profiles p ON r.email = (SELECT email FROM users WHERE id = p.user_id)
             WHERE r.event_id = ? 
             ORDER BY r.created_at DESC`,
            [eventId]
        );
    }

    static async findByOrganiser(database, userId) {
        return await database.all(
            `SELECT r.*, p.full_name, p.avatar_url, e.title as event_title
             FROM registrations r
             JOIN events e ON r.event_id = e.id
             LEFT JOIN profiles p ON r.email = (SELECT email FROM users WHERE id = p.user_id)
             WHERE e.created_by = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );
    }

    static async countByEventId(database, eventId) {
        const result = await database.get(
            'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status = ?',
            [eventId, 'confirmed']
        );
        return result ? result.count : 0;
    }

    static async update(database, id, { firstName, lastName, email, phone, status }) {
        const updates = [];
        const params = [];

        if (firstName) {
            updates.push('first_name = ?');
            params.push(firstName);
        }
        if (lastName) {
            updates.push('last_name = ?');
            params.push(lastName);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone);
        }
        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length === 0) return;

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await database.run(
            `UPDATE registrations SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
    }

    static async delete(database, id) {
        await database.run('DELETE FROM registrations WHERE id = ?', [id]);
    }

    static async deleteByEventId(database, eventId) {
        await database.run('DELETE FROM registrations WHERE event_id = ?', [eventId]);
    }
}

module.exports = Registration;
