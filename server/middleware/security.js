const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';
const allowedRequestHeaders = ['Content-Type', 'Authorization', 'x-session-id'];

const getAllowedOrigins = () => {
    const configured = process.env.CORS_ORIGINS || process.env.CLIENT_URL || '';

    return configured
        .split(',')
        .map((value) => value.trim().replace(/\/+$/, ''))
        .filter(Boolean);
};

// In development: allow all origins. In production: strict allowlist.
const corsOptions = isDev
    ? { origin: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: allowedRequestHeaders, credentials: true }
    : {
        origin: (origin, callback) => {
            // allow server-to-server or curl (no origin) but enforce allowlist for browser origins
            if (!origin) return callback(null, true);
            const allowedOrigins = getAllowedOrigins();
            // Validate allowedOrigins for production safety
            const invalidConfigured = allowedOrigins.filter((o) => o.startsWith('http:') || o.includes('localhost'));
            if (invalidConfigured.length) {
                console.error('CORS_ORIGINS contains insecure or localhost entries:', invalidConfigured.join(', '));
                return callback(new Error('Server CORS configuration invalid - remove http:// or localhost entries from CORS_ORIGINS'), false);
            }
            if (allowedOrigins.length === 0) {
                return callback(new Error('No CORS origins configured for production'), false);
            }
            if (allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
                return callback(null, true);
            }
            return callback(new Error('CORS policy blocked this origin'));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                allowedHeaders: allowedRequestHeaders,
        credentials: false,
        maxAge: 86400,
      };

// In development: no rate limiting (pass-through middleware).
const _noLimit = (_req, _res, next) => next();

const globalRateLimit = isDev
    ? _noLimit
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: Number(process.env.RATE_LIMIT_MAX || 300),
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests. Please try again later.' },
      });

const authRateLimit = isDev
    ? _noLimit
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many authentication attempts. Please try again later.' },
      });

const analyticsEventRateLimit = isDev
        ? _noLimit
        : rateLimit({
                windowMs: 15 * 60 * 1000,
                limit: Number(process.env.ANALYTICS_EVENT_RATE_LIMIT_MAX || 180),
                standardHeaders: true,
                legacyHeaders: false,
                message: { error: 'Too many analytics events. Please slow down.' },
            });

// In development: skip Helmet (avoids header conflicts with React dev server / HMR).
const securityHeaders = isDev
    ? (_req, _res, next) => next()
    : helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
      });

module.exports = {
    corsOptions,
    globalRateLimit,
    authRateLimit,
    analyticsEventRateLimit,
    securityHeaders,
};
