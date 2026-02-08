const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate JWT token
 */
function generateToken(payload) {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiry
    });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        return null;
    }
}

/**
 * Decode JWT token without verification
 */
function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};
