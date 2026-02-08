const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 */
function validatePassword(password) {
    if (!password || password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    // Optional: Add more complexity requirements
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumbers = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*]/.test(password);

    return { valid: true };
}

module.exports = {
    hashPassword,
    comparePassword,
    validatePassword
};
