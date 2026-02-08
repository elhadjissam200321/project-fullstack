const { v4: uuidv4 } = require('uuid');

class Profile {
    static async create(database, { userId, fullName, role }) {
        const id = uuidv4();
        await database.run(
            `INSERT INTO profiles (id, user_id, full_name, role) 
             VALUES (?, ?, ?, ?)`,
            [id, userId, fullName, role]
        );
        return id;
    }

    static async findByUserId(database, userId) {
        return await database.get(
            'SELECT * FROM profiles WHERE user_id = ?',
            [userId]
        );
    }

    static async findById(database, id) {
        return await database.get(
            'SELECT * FROM profiles WHERE id = ?',
            [id]
        );
    }

    static async update(database, userId, { fullName, role }) {
        const updates = [];
        const params = [];

        if (fullName) {
            updates.push('full_name = ?');
            params.push(fullName);
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }

        if (updates.length === 0) return;

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(userId);

        await database.run(
            `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = ?`,
            params
        );
    }

    static async delete(database, userId) {
        await database.run('DELETE FROM profiles WHERE user_id = ?', [userId]);
    }
}

module.exports = Profile;
