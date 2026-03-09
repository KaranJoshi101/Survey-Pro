// Survey Routes
const express = require('express');
const router = express.Router();
const {
    getAllSurveys,
    getSurveyById,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    addQuestion,
    addOption
} = require('../controllers/surveyController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllSurveys);
router.get('/:id', getSurveyById);

// Admin routes (protected)
router.post('/', authenticate, authorize, createSurvey);
router.put('/:id', authenticate, authorize, updateSurvey);
router.delete('/:id', authenticate, authorize, deleteSurvey);

// Question management
router.post('/:surveyId/questions', authenticate, authorize, addQuestion);
router.post('/questions/:questionId/options', authenticate, authorize, addOption);

module.exports = router;
