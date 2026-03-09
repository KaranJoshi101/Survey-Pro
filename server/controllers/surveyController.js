// Survey Controller
const pool = require('../config/database');

// Get all surveys (with pagination)
const getAllSurveys = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM surveys';
        let countQuery = 'SELECT COUNT(*) FROM surveys';
        const params = [];

        if (status) {
            query += ' WHERE status = $1';
            countQuery += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);

        const surveys = await pool.query(query, [...params, limit, offset]);
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            surveys: surveys.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        next(err);
    }
};

// Get survey by ID with questions
const getSurveyById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const surveyResult = await pool.query(
            'SELECT * FROM surveys WHERE id = $1',
            [id]
        );

        if (surveyResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Survey not found',
            });
        }

        const questionsResult = await pool.query(
            'SELECT q.*, json_agg(json_build_object(\'id\', o.id, \'option_text\', o.option_text, \'order_index\', o.order_index)) as options FROM questions q LEFT JOIN options o ON q.id = o.question_id WHERE q.survey_id = $1 GROUP BY q.id ORDER BY q.order_index',
            [id]
        );

        const survey = surveyResult.rows[0];
        survey.questions = questionsResult.rows;

        res.json({ survey });
    } catch (err) {
        next(err);
    }
};

// Create survey (admin only)
const createSurvey = async (req, res, next) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                error: 'Title is required',
            });
        }

        const result = await pool.query(
            'INSERT INTO surveys (title, description, created_by, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description || null, req.user.userId, 'draft']
        );

        res.status(201).json({
            message: 'Survey created successfully',
            survey: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

// Update survey (admin only)
const updateSurvey = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        const result = await pool.query(
            'UPDATE surveys SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status), updated_at = NOW() WHERE id = $4 RETURNING *',
            [title, description, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Survey not found',
            });
        }

        res.json({
            message: 'Survey updated successfully',
            survey: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

// Delete survey (admin only)
const deleteSurvey = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM surveys WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Survey not found',
            });
        }

        res.json({
            message: 'Survey deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};

// Add question to survey
const addQuestion = async (req, res, next) => {
    try {
        const { surveyId } = req.params;
        const { question_text, question_type, is_required, order_index } = req.body;

        if (!question_text || !question_type) {
            return res.status(400).json({
                error: 'question_text and question_type are required',
            });
        }

        const result = await pool.query(
            'INSERT INTO questions (survey_id, question_text, question_type, is_required, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [surveyId, question_text, question_type, is_required !== false, order_index || 1]
        );

        res.status(201).json({
            message: 'Question added successfully',
            question: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

// Add options to question
const addOption = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { option_text, order_index } = req.body;

        if (!option_text) {
            return res.status(400).json({
                error: 'option_text is required',
            });
        }

        const result = await pool.query(
            'INSERT INTO options (question_id, option_text, order_index) VALUES ($1, $2, $3) RETURNING *',
            [questionId, option_text, order_index || 1]
        );

        res.status(201).json({
            message: 'Option added successfully',
            option: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllSurveys,
    getSurveyById,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    addQuestion,
    addOption,
};
