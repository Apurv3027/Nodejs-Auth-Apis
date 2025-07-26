const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // Automatically remove expired tokens
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);