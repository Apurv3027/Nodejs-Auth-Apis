const Joi = require('joi');

// Registration validation schema
const registerValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(6)
            .required()
            .messages({
                'string.min': 'Password must be at least 6 characters long',
                'any.required': 'Password is required'
            }),
        firstName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.min': 'First name must be at least 2 characters long',
                'string.max': 'First name cannot exceed 50 characters',
                'any.required': 'First name is required'
            }),
        lastName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.min': 'Last name must be at least 2 characters long',
                'string.max': 'Last name cannot exceed 50 characters',
                'any.required': 'Last name is required'
            })
    });

    return schema.validate(data);
};

// Login validation schema
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'Password is required'
            })
    });

    return schema.validate(data);
};

// Forgot password validation schema
const forgotPasswordValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required'
            })
    });

    return schema.validate(data);
};

// Reset password validation schema
const resetPasswordValidation = (data) => {
    const schema = Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'any.required': 'Reset token is required'
            }),
        newPassword: Joi.string()
            .min(6)
            .required()
            .messages({
                'string.min': 'New password must be at least 6 characters long',
                'any.required': 'New password is required'
            })
    });

    return schema.validate(data);
};

module.exports = {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation
};