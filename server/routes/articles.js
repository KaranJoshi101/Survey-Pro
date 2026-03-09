// Article Routes
const express = require('express');
const router = express.Router();
const {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getAdminArticles
} = require('../controllers/articleController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getArticles);

// Admin routes (protected) - must come before /:id to avoid route conflicts
router.get('/admin/my-articles', authenticate, authorize, getAdminArticles);
router.post('/', authenticate, authorize, createArticle);
router.put('/:id', authenticate, authorize, updateArticle);
router.delete('/:id', authenticate, authorize, deleteArticle);

// Public parameterized route (must be last)
router.get('/:id', getArticleById);

module.exports = router;
