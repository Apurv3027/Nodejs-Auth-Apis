const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } = require('../middleware/validation');

const JWT_SECRET = process.env.JWT_SECRET || '6d59ba8f32d53c94eda004767ea6ba176e5163dbf50ff9d3dc76296b57ac3cfd994cb5f5ed43fc222205819a2d2c974399e5d67dbdca59705069821e4737c442';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Simulate sending email (replace with actual email service)
const sendPasswordResetEmail = async (email, resetToken, firstName) => {
    // In production, integrate with services like SendGrid, Nodemailer, etc.
    console.log(`
    ========================================
    PASSWORD RESET EMAIL SIMULATION
    ========================================
    To: ${email}
    Subject: Password Reset Request
    
    Hello ${firstName},
    
    You requested a password reset. Please use the following token to reset your password:
    
    Reset Token: ${resetToken}
    
    This token will expire in 10 minutes.
    
    If you didn't request this, please ignore this email.
    
    Best regards,
    Your App Team
    ========================================
  `);

    return true; // Simulate successful email sending
};

// Register user
const register = async (req, res) => {
    try {
        // Validate input
        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            email,
            password,
            firstName,
            lastName
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        // Validate input
        const { error } = loginValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Decode token to get expiration
        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000);

        // Add token to blacklist
        const blacklistedToken = new BlacklistedToken({
            token,
            expiresAt
        });

        await blacklistedToken.save();

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        // Validate input
        const { error } = forgotPasswordValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists for security
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        try {
            // Send password reset email
            await sendPasswordResetEmail(user.email, resetToken, user.firstName);

            res.status(200).json({
                success: true,
                message: 'Password reset instructions sent to your email',
                // In development, include the token for testing
                ...(process.env.NODE_ENV === 'development' && { resetToken })
            });

        } catch (emailError) {
            // If email fails, clear the reset token
            user.clearPasswordResetToken();
            await user.save({ validateBeforeSave: false });

            console.error('Email sending error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'There was an error sending the email. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        // Validate input
        const { error } = resetPasswordValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { token, newPassword } = req.body;

        // Find user with valid reset token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token is invalid or has expired'
            });
        }

        // Update password
        user.password = newPassword;
        user.clearPasswordResetToken();
        await user.save();

        // Generate new JWT token
        const jwtToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            data: {
                user,
                token: jwtToken
            }
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
};