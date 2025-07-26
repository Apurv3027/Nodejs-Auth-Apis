require('dotenv').config();

const mongoose = require('mongoose');

// MongoDB Atlas cluster connection
const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;

// Enhanced connection options for MongoDB Atlas
const connectDB = async () => {
    try {
        console.log('=== MongoDB Connection Debug Info ===');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('MONGODB_ATLAS_URI exists:', !!process.env.MONGODB_ATLAS_URI);
        console.log('MONGODB_ATLAS_URI length:', process.env.MONGODB_ATLAS_URI?.length || 0);

        // More detailed URI checking
        if (!MONGODB_ATLAS_URI) {
            console.error('❌ MONGODB_ATLAS_URI is not defined in environment variables');
            console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
            throw new Error('MONGODB_ATLAS_URI environment variable is required');
        }

        // Validate URI format
        if (!MONGODB_ATLAS_URI.startsWith('mongodb')) {
            throw new Error('Invalid MongoDB URI format');
        }

        console.log('✅ Attempting to connect to MongoDB Atlas...');
        console.log('URI preview:', MONGODB_ATLAS_URI.substring(0, 20) + '...');

        const conn = await mongoose.connect(MONGODB_ATLAS_URI, {
            // Atlas-optimized connection options
            serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverApi: {
                version: '1', // Use Stable API version 1
                strict: true,
                deprecationErrors: true,
            }
        });

        console.log(`✅ MongoDB Atlas connected successfully!`);
        console.log(`Host: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        console.log(`Connection state: ${conn.connection.readyState}`);
    } catch (error) {
        console.error('❌ MongoDB Atlas connection error:', error.message);

        // More specific error handling
        if (error.message.includes('ENOTFOUND')) {
            console.error('DNS resolution failed. Check your internet connection and URI.');
        } else if (error.message.includes('authentication failed')) {
            console.error('Authentication failed. Check your username and password.');
        } else if (error.message.includes('timeout')) {
            console.error('Connection timeout. Check your network and Atlas cluster status.');
        }

        console.error('Full error details:', error);
        process.exit(1);
    }
};

// Handle MongoDB connection events with more detailed logging
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected from MongoDB Atlas');
});

mongoose.connection.on('reconnected', () => {
    console.log('🟢 Mongoose reconnected to MongoDB Atlas');
});

// Graceful shutdown with better logging
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed gracefully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;