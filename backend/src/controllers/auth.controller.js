const User = require('../models/User');
const Profile = require('../models/Profile');
const { hashPassword, comparePassword, validatePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const database = require('../config/database');

/**
 * Register new user
 */
async function register(req, res) {
    try {
        const { email, password, fullName, role, secretQuestion, secretAnswer } = req.body;

        // Validate input
        if (!email || !password || !fullName || !role || !secretQuestion || !secretAnswer) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }

        // Validate role
        if (!['organisateur', 'participant'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be "organisateur" or "participant"' });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(database, email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password and secret answer
        const passwordHash = await hashPassword(password);
        const secretAnswerHash = await hashPassword(secretAnswer.toLowerCase().trim());

        // Create user
        const userId = await User.create(database, {
            email,
            passwordHash,
            secretQuestion,
            secretAnswerHash
        });

        // Create profile
        await Profile.create(database, {
            userId,
            fullName,
            role
        });

        // Generate token
        const token = generateToken({ userId, email, role });

        // Return user data
        res.status(201).json({
            token,
            user: {
                id: userId,
                email,
                fullName,
                role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

        // Handle network/connection errors specifically
        if (error.message && (error.message.includes('fetch failed') || error.message.includes('timeout'))) {
            return res.status(503).json({
                error: 'Le serveur de base de données est injoignable (Timeout). Veuillez vérifier votre connexion internet.'
            });
        }

        res.status(500).json({ error: 'Registration failed' });
    }
}

/**
 * Get secret question for a user
 */
async function getSecretQuestion(req, res) {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findByEmail(database, email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ secretQuestion: user.secret_question });
    } catch (error) {
        console.error('Get secret question error:', error);

        if (error.message && (error.message.includes('fetch failed') || error.message.includes('timeout'))) {
            return res.status(503).json({
                error: 'Impossible de joindre la base de données. Veuillez vérifier votre connexion.'
            });
        }

        res.status(500).json({ error: 'Failed to fetch secret question' });
    }
}

/**
 * Reset password using secret answer
 */
async function resetPassword(req, res) {
    try {
        const { email, secretAnswer, newPassword } = req.body;

        if (!email || !secretAnswer || !newPassword) {
            return res.status(400).json({ error: 'Email, answer, and new password are required' });
        }

        // Find user
        const user = await User.findByEmail(database, email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify secret answer
        const isAnswerCorrect = await comparePassword(secretAnswer.toLowerCase().trim(), user.secret_answer_hash);
        if (!isAnswerCorrect) {
            return res.status(401).json({ error: 'Incorrect secret answer' });
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }

        // Hash and update new password
        const passwordHash = await hashPassword(newPassword);
        await User.updatePassword(database, user.id, passwordHash);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);

        if (error.message && (error.message.includes('fetch failed') || error.message.includes('timeout'))) {
            return res.status(503).json({
                error: 'Impossible de joindre la base de données pour réinitialiser le mot de passe. Veuillez vérifier votre connexion.'
            });
        }

        res.status(500).json({ error: 'Failed to reset password' });
    }
}

/**
 * Login user
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findByEmail(database, email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get profile
        let profile = await Profile.findByUserId(database, user.id);
        if (!profile) {
            // Fallback: try to find by email if user_id lookup fails (e.g. legacy data)
            const fallbackProfile = await database.get('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
            if (fallbackProfile) {
                profile = fallbackProfile;
            } else {
                return res.status(500).json({ error: 'Profile not found' });
            }
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: profile.role
        });

        // Return user data
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: profile.full_name,
                role: profile.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);

        if (error.message && (error.message.includes('fetch failed') || error.message.includes('timeout'))) {
            return res.status(503).json({
                error: 'Le serveur de base de données est injoignable (Timeout). Veuillez vérifier votre connexion internet.'
            });
        }

        res.status(500).json({ error: 'Login failed' });
    }
}

/**
 * Get current user
 */
async function getCurrentUser(req, res) {
    try {
        res.json({
            user: req.user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
}

/**
 * Logout (client-side token removal)
 */
function logout(req, res) {
    res.json({ message: 'Logged out successfully' });
}

/**
 * Update user profile
 */
async function updateProfile(req, res) {
    try {
        const { fullName } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!fullName || fullName.trim().length < 2) {
            return res.status(400).json({ error: 'Full name must be at least 2 characters' });
        }

        if (fullName.length > 100) {
            return res.status(400).json({ error: 'Full name must be less than 100 characters' });
        }

        // Get current profile
        const profile = await Profile.findByUserId(database, userId);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Update profile
        await Profile.update(database, userId, {
            fullName: fullName.trim()
        });

        // Get updated profile
        const updatedProfile = await Profile.findByUserId(database, userId);

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: userId,
                email: req.user.email,
                fullName: updatedProfile.full_name,
                role: updatedProfile.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

module.exports = {
    register,
    login,
    getCurrentUser,
    logout,
    updateProfile,
    getSecretQuestion,
    resetPassword
};
