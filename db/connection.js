require('dotenv').config();

const mongoose = require('mongoose');

// MongoDB Atlas cluster connection
const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;

// Enhanced connection options for MongoDB Atlas
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB Atlas URI:', process.env.MONGODB_ATLAS_URI ? 'Set' : 'Not set');

        // const conn = await mongoose.connect(MONGODB_ATLAS_URI, {
        const conn = await mongoose.connect(process.env.MONGODB_ATLAS_URI, {
            // Additional options for Atlas connection
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferCommands: false, // Disable mongoose buffering
        });

        console.log(`MongoDB Atlas connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB Atlas connection error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});

module.exports = connectDB;