// Article Controller
const pool = require('../config/database');

// Get published articles
const getArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const articlesResult = await pool.query(
            `SELECT
                a.id,
                a.title,
                a.content,
                a.author,
                u.name as author_name,
                CASE
                    WHEN EXISTS (SELECT 1 FROM media_posts mp WHERE mp.article_id = a.id) THEN true
                    ELSE a.is_published
                END AS is_published,
                a.created_at
             FROM articles a
             JOIN users u ON a.author = u.id
             WHERE (
                a.is_published = true
                OR EXISTS (SELECT 1 FROM media_posts mp WHERE mp.article_id = a.id)
             )
             ORDER BY a.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*)
             FROM articles a
             WHERE (
                a.is_published = true
                OR EXISTS (SELECT 1 FROM media_posts mp WHERE mp.article_id = a.id)
             )`
        );

        res.json({
            articles: articlesResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
            },
        });
    } catch (err) {
        next(err);
    }
};

// Get article by ID
const getArticleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                a.id,
                a.title,
                a.content,
                a.author,
                u.name as author_name,
                CASE
                    WHEN EXISTS (SELECT 1 FROM media_posts mp WHERE mp.article_id = a.id) THEN true
                    ELSE a.is_published
                END AS is_published,
                a.created_at,
                a.updated_at
             FROM articles a
             JOIN users u ON a.author = u.id
             WHERE a.id = $1
               AND (
                    a.is_published = true
                    OR EXISTS (SELECT 1 FROM media_posts mp WHERE mp.article_id = a.id)
               )`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Article not found',
            });
        }

        res.json({ article: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// Create article (admin only)
const createArticle = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                error: 'Title and content are required',
            });
        }

        const result = await pool.query(
            'INSERT INTO articles (title, content, author, is_published) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, req.user.userId, false]
        );

        res.status(201).json({
            message: 'Article created successfully',
            article: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

// Update article (admin only)
const updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, is_published } = req.body;

        if (is_published === false) {
            const talkCheck = await pool.query(
                'SELECT 1 FROM media_posts WHERE article_id = $1 LIMIT 1',
                [id]
            );

            if (talkCheck.rows.length > 0) {
                return res.status(400).json({
                    error: 'Talk articles must remain published',
                });
            }
        }

        const result = await pool.query(
            'UPDATE articles SET title = COALESCE($1, title), content = COALESCE($2, content), is_published = COALESCE($3, is_published), updated_at = NOW() WHERE id = $4 RETURNING *',
            [title, content, is_published, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Article not found',
            });
        }

        res.json({
            message: 'Article updated successfully',
            article: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

// Delete article (admin only)
const deleteArticle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM articles WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Article not found',
            });
        }

        res.json({
            message: 'Article deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};

// Get admin articles (for editing)
const getAdminArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const articlesResult = await pool.query(
            `SELECT
                a.*,
                EXISTS (
                    SELECT 1
                    FROM media_posts mp
                    WHERE mp.article_id = a.id
                ) AS is_talk,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM media_posts mp
                        WHERE mp.article_id = a.id
                    ) THEN true
                    ELSE a.is_published
                END AS effective_is_published
             FROM articles a
             WHERE a.author = $1
             ORDER BY a.created_at DESC
             LIMIT $2 OFFSET $3`,
            [req.user.userId, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM articles WHERE author = $1',
            [req.user.userId]
        );

        const normalizedArticles = articlesResult.rows.map((article) => ({
            ...article,
            is_published: article.effective_is_published,
        }));

        res.json({
            articles: normalizedArticles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getAdminArticles,
};
