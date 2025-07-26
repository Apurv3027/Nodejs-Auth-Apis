const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const path = require('path');
const fs = require('fs');
const connectDB = require('./db/connection');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // MongoDB connection
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_api';

// mongoose.connect(MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => console.log('MongoDB connected successfully'))
//     .catch((err) => console.error('MongoDB connection error:', err));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Home screen route
app.get('/', (req, res) => {
    try {
        const htmlPath = path.join(__dirname, 'views', 'home-screen.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Inject dynamic data
        const serverInfo = {
            uptime: formatUptime(process.uptime()),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'Development',
            nodeVersion: process.version,
            timestamp: new Date().toLocaleString()
        };

        // Replace placeholders in HTML
        htmlContent = htmlContent
            .replace('v1.0.0', serverInfo.version)
            .replace('Production', serverInfo.environment)
            .replace('Loading...', serverInfo.uptime);

        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);

    } catch (error) {
        console.error('Error serving health check UI:', error);
        res.status(500).json({
            error: 'Unable to load health check UI',
            message: 'Authentication API is running!',
            documentation: '/api-docs'
        });
    }
});

// Helper function to format uptime
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});