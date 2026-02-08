const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const dbDir = path.dirname(dbPath);

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database instance
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database:', dbPath);
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) console.error('Error enabling foreign keys:', err.message);
});

/**
 * Promisified database methods
 */
const database = {
    // Run a query (INSERT, UPDATE, DELETE)
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },

    // Get a single row
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Get all matching rows
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Close database
    close() {
        return new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};

module.exports = database;
