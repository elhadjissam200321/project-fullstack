const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const database = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const registrationsRoutes = require('./routes/registrations.routes');
const statsRoutes = require('./routes/stats.routes');
const seedRoutes = require('./routes/seed.routes');

const app = express();

// Middleware
app.use(cors({
    origin: ['https://eventflow.issamdev.com', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root and Health endpoints
app.get('/', (req, res) => {
    res.send('AcadeMeet API is running smoothly.');
});

const healthCheck = (req, res) => res.json({
    status: 'ok',
    message: 'AcadeMeet API is running!',
    time: new Date().toISOString()
});

app.get('/api', healthCheck);
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// API Routes helper
const register = (path, router) => {
    app.use(path, router);
    app.use('/api' + path, router);
};

register('/auth', authRoutes);
register('/events', eventsRoutes);
register('/registrations', registrationsRoutes);
register('/stats', statsRoutes);
register('/seed', seedRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        console.log('✅ SQLite database ready');

        app.listen(config.port, () => {
            console.log(`🚀 Server running on http://localhost:${config.port}`);
            console.log(`📊 Environment: ${config.nodeEnv}`);
            console.log('\n✅ Backend ready!\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await database.close();
    process.exit(0);
});

startServer();

module.exports = app;
