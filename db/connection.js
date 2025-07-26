const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Atlas cluster connection
const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;

// Enhanced connection options for MongoDB Atlas
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_ATLAS_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Additional options for Atlas connection
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            bufferCommands: false, // Disable mongoose buffering
        });

        console.log(`MongoDB Atlas connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB Atlas connection error:', error.message);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB Atlas disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB Atlas connection error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB Atlas connection closed');
    process.exit(0);
});

module.exports = connectDB;