const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.put('/profile', authenticate, authController.updateProfile);

// Secret question based recovery
router.get('/secret-question', authController.getSecretQuestion);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
