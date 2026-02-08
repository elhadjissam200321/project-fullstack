const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Profile = require('../models/Profile');
const database = require('../config/database');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
async function authenticate(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get user from database
        const user = await User.findById(database, decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Get user profile
        const profile = await Profile.findByUserId(database, user.id);

        // Attach user and profile to request
        req.user = {
            id: user.id,
            email: user.email,
            role: profile?.role || 'participant',
            fullName: profile?.full_name || ''
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
}

/**
 * Check if user is an organisateur
 */
function requireOrganisateur(req, res, next) {
    if (req.user.role !== 'organisateur') {
        return res.status(403).json({ error: 'Access denied. Organisateur role required.' });
    }
    next();
}

/**
 * Check if user is a super_admin
 */
function requireSuperAdmin(req, res, next) {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Access denied. Super Admin role required.' });
    }
    next();
}

module.exports = {
    authenticate,
    requireOrganisateur,
    requireSuperAdmin
};
