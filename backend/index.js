const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather_app';
const LOCAL_MONGODB_URI = 'mongodb://127.0.0.1:27017/weather_app';
let dbReady = false;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
const connectMongo = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 3500,
        });
        console.log('✓ Connected to MongoDB');
        dbReady = true;
        return true;
    } catch (err) {
        console.error('✗ MongoDB connection error:', err.message);
        if (MONGODB_URI !== LOCAL_MONGODB_URI) {
            try {
                console.log('↪ Trying local MongoDB fallback at 127.0.0.1...');
                await mongoose.connect(LOCAL_MONGODB_URI, {
                    serverSelectionTimeoutMS: 2500,
                });
                console.log('✓ Connected to local MongoDB fallback');
                dbReady = true;
                return true;
            } catch (localErr) {
                console.error('✗ Local MongoDB fallback failed:', localErr.message);
            }
        }
        dbReady = false;
        return false;
    }
};

// Block API traffic until database is connected to avoid Mongoose buffering timeouts.
app.use((req, res, next) => {
    if (!dbReady && req.path.startsWith('/api')) {
        return res.status(503).json({
            success: false,
            error: 'Database is still starting. Please retry in a few seconds.',
        });
    }
    next();
});

// API Routes
app.use('/api', weatherRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Backend API is running', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
    });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
    await connectMongo();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 API Documentation:`);
        console.log(`   POST   /api/weather              - Create new weather record`);
        console.log(`   GET    /api/weather              - Get all weather records`);
        console.log(`   GET    /api/weather/:id          - Get weather record by ID`);
        console.log(`   GET    /api/weather/location/:name - Get weather by location`);
        console.log(`   GET    /api/geo                  - Resolve/validate a location`);
        console.log(`   PUT    /api/weather/:id          - Update weather record`);
        console.log(`   DELETE /api/weather/:id          - Delete weather record`);
        console.log(`   GET    /api/export/weather       - Export weather data`);
    });
};

startServer();

module.exports = app;
