const fs = require('fs');
const path = require('path');
const database = require('../config/database');

async function initializeDatabase() {
    try {
        console.log('🔧 Initializing database...');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon and execute each statement
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
            await database.run(statement);
        }

        console.log('✅ Database initialized successfully');
        console.log('📊 Tables created: users, profiles, events, registrations');

        await database.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
