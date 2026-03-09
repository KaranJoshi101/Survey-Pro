// Response Routes
const express = require('express');
const router = express.Router();
const {
    submitResponse,
    getUserResponses,
    getSurveyResponses,
    getResponseDetails,
    getSurveyAnalytics,
    exportSurveyResponses,
    getSurveyDemographics
} = require('../controllers/responseController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/', authenticate, submitResponse);

// User routes
router.get('/user', authenticate, getUserResponses);

// Admin routes (protected)
// More specific routes must come before less specific ones
router.get('/survey/:surveyId/export', authenticate, authorize, exportSurveyResponses);
router.get('/survey/:surveyId/demographics', authenticate, authorize, getSurveyDemographics);
router.get('/survey/:surveyId/analytics', authenticate, authorize, getSurveyAnalytics);
router.get('/survey/:surveyId', authenticate, authorize, getSurveyResponses);
router.get('/:responseId', authenticate, getResponseDetails);

module.exports = router;
