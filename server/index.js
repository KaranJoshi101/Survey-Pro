// Main Express Server
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Route imports
const authRoutes = require('./routes/auth');
const surveyRoutes = require('./routes/surveys');
const responseRoutes = require('./routes/responses');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');

// Middleware imports
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Survey Application API is running',
        timestamp: new Date().toISOString(),
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Survey Application API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            surveys: '/api/surveys',
            responses: '/api/responses',
            articles: '/api/articles',
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.SERVER_PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║     🚀 Survey Application API Server Started      ║
╚═══════════════════════════════════════════════════╝

📍 Server running on: http://localhost:${PORT}
🗄️  Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}
📊 Environment: ${process.env.NODE_ENV}

Available Endpoints:
  GET  /                  - API info
  GET  /api/health        - Health check

Auth:
  POST /api/auth/register - Register new user
  POST /api/auth/login    - Login user
  GET  /api/auth/me       - Get current user (protected)

Surveys:
  GET  /api/surveys       - Get all surveys
  GET  /api/surveys/:id   - Get survey details
  POST /api/surveys       - Create survey (admin)
  PUT  /api/surveys/:id   - Update survey (admin)
  DELETE /api/surveys/:id - Delete survey (admin)

Responses:
  GET  /api/responses/:surveyId  - Get survey responses
  POST /api/responses            - Submit response
  GET  /api/responses/:id        - Get response details

Articles:
  GET  /api/articles     - Get published articles
  GET  /api/articles/:id - Get article details
  POST /api/articles     - Create article (admin)
  PUT  /api/articles/:id  - Update article (admin)
  DELETE /api/articles/:id - Delete article (admin)

    `);
});

module.exports = app;
