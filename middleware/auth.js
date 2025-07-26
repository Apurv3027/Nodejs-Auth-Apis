const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');

const JWT_SECRET = process.env.JWT_SECRET || '6d59ba8f32d53c94eda004767ea6ba176e5163dbf50ff9d3dc76296b57ac3cfd994cb5f5ed43fc222205819a2d2c974399e5d67dbdca59705069821e4737c442';

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Check if token is blacklisted
        const blacklistedToken = await BlacklistedToken.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({
                success: false,
                message: 'Token has been invalidated'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        req.user = user;
        req.token = token; // Store token for logout functionality
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = { authenticateToken };