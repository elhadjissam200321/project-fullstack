const { v4: uuidv4 } = require('uuid');

class User {
    static async create(database, { email, passwordHash, secretQuestion, secretAnswerHash }) {
        const id = uuidv4();
        await database.run(
            `INSERT INTO users (id, email, password_hash, secret_question, secret_answer_hash) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, email, passwordHash, secretQuestion, secretAnswerHash]
        );
        return id;
    }

    static async findByEmail(database, email) {
        return await database.get(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
    }

    static async findById(database, id) {
        return await database.get(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
    }

    static async updatePassword(database, userId, passwordHash) {
        await database.run(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [passwordHash, userId]
        );
    }

    static async update(database, userId, { email, passwordHash }) {
        const updates = [];
        const params = [];

        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        if (passwordHash) {
            updates.push('password_hash = ?');
            params.push(passwordHash);
        }

        if (updates.length === 0) return;

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(userId);

        await database.run(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
    }

    static async delete(database, userId) {
        await database.run('DELETE FROM users WHERE id = ?', [userId]);
    }
}

module.exports = User;
