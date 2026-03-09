import api from './api';

const surveyService = {
    // Get all surveys
    getAllSurveys: (page = 1, limit = 10, status = null) => {
        let url = `/surveys?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return api.get(url);
    },

    // Get survey by ID
    getSurveyById: (id) =>
        api.get(`/surveys/${id}`),

    // Create survey (admin)
    createSurvey: (title, description) =>
        api.post('/surveys', { title, description }),

    // Update survey (admin)
    updateSurvey: (id, data) =>
        api.put(`/surveys/${id}`, data),

    // Delete survey (admin)
    deleteSurvey: (id) =>
        api.delete(`/surveys/${id}`),

    // Add question to survey (admin)
    addQuestion: (surveyId, question_text, question_type, is_required = true, order_index = 1) =>
        api.post(`/surveys/${surveyId}/questions`, {
            question_text,
            question_type,
            is_required,
            order_index,
        }),

    // Add option to question (admin)
    addOption: (questionId, option_text, order_index = 1) =>
        api.post(`/surveys/questions/${questionId}/options`, {
            option_text,
            order_index,
        }),

    // Delete option from question (admin)
    deleteOption: (optionId) =>
        api.delete(`/surveys/questions/options/${optionId}`),

    // Publish survey (admin)
    publishSurvey: (id) =>
        api.put(`/surveys/${id}`, { status: 'published' }),

    // Unpublish survey (admin)
    unpublishSurvey: (id) =>
        api.put(`/surveys/${id}`, { status: 'draft' }),
};

export default surveyService;
