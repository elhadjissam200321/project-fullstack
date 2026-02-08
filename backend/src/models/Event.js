const { v4: uuidv4 } = require('uuid');

class Event {
    static async create(database, { title, description, location, category, capacity, eventDate, imageUrl, createdBy }) {
        const id = uuidv4();
        await database.run(
            `INSERT INTO events (id, title, description, location, category, capacity, event_date, image_url, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, title, description, location, category, capacity, eventDate, imageUrl, createdBy]
        );
        return id;
    }

    static async findAll(database, { limit, offset, upcoming = false } = {}) {
        let sql = 'SELECT * FROM events';
        const params = [];

        if (upcoming) {
            sql += ' WHERE event_date >= datetime("now")';
        }

        sql += ' ORDER BY event_date ASC';

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
            'SELECT * FROM events WHERE id = ?',
            [id]
        );
    }

    static async findByOrganiser(database, organiserId) {
        return await database.all(
            'SELECT * FROM events WHERE created_by = ? ORDER BY event_date DESC',
            [organiserId]
        );
    }

    static async update(database, id, { title, description, location, category, capacity, eventDate, imageUrl }) {
        const updates = [];
        const params = [];

        if (title) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (location) {
            updates.push('location = ?');
            params.push(location);
        }
        if (category) {
            updates.push('category = ?');
            params.push(category);
        }
        if (capacity) {
            updates.push('capacity = ?');
            params.push(capacity);
        }
        if (eventDate) {
            updates.push('event_date = ?');
            params.push(eventDate);
        }
        if (imageUrl !== undefined) {
            updates.push('image_url = ?');
            params.push(imageUrl);
        }

        if (updates.length === 0) return;

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await database.run(
            `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
    }

    static async delete(database, id) {
        await database.run('DELETE FROM events WHERE id = ?', [id]);
    }

    static async deleteByOrganiser(database, organiserId) {
        await database.run('DELETE FROM events WHERE created_by = ?', [organiserId]);
    }
}

module.exports = Event;
