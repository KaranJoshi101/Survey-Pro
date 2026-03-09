// User Routes (Admin)
const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    banUser,
    unbanUser,
    getDashboardStats,
    getProfile,
    updateProfile,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Profile routes (any authenticated user) - must come before /:id routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Admin routes require admin authentication
router.get('/', authenticate, authorize, getAllUsers);
router.get('/dashboard-stats', authenticate, authorize, getDashboardStats);
router.put('/:id/ban', authenticate, authorize, banUser);
router.put('/:id/unban', authenticate, authorize, unbanUser);

module.exports = router;
