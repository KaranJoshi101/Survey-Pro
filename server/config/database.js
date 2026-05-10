// Database connection configuration for Postgres
const { Pool } = require('pg');
const path = require('path');
const { loadEnvironment } = require('./loadEnv');

loadEnvironment(path.join(__dirname, '../..'));

const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const isSslEnabled = parseBoolean(process.env.DB_SSL, false);

const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: isSslEnabled ? { rejectUnauthorized: false } : undefined,
    max: parseInt(process.env.DB_POOL_SIZE || '10', 10),
});

const eventHandlers = new Map();

const formatResult = (pgResult) => {
    const rows = Array.isArray(pgResult?.rows) ? pgResult.rows : [];
    return {
        rows,
        rowCount: typeof pgResult?.rowCount === 'number' ? pgResult.rowCount : rows.length,
        command: pgResult?.command,
    };
};

const executeQuery = async (clientOrPool, sqlText, params = []) => {
    const conn = clientOrPool || pgPool;
    const result = await conn.query(sqlText, params);
    return formatResult(result);
};

const db = {
    async query(sqlText, params, callback) {
        const hasCallback = typeof callback === 'function' || typeof params === 'function';
        const actualParams = Array.isArray(params) ? params : [];
        const actualCallback = typeof params === 'function' ? params : callback;

        const promise = executeQuery(null, sqlText, actualParams);

        if (hasCallback) {
            promise.then((result) => actualCallback(null, result)).catch((err) => actualCallback(err));
        }

        return promise;
    },

    async connect() {
        const client = await pgPool.connect();
        return {
            async query(sqlText, params) {
                const safeParams = Array.isArray(params) ? params : [];
                return executeQuery(client, sqlText, safeParams);
            },
            async release() {
                client.release();
            },
            async end() {
                client.release();
            },
            async beginTransaction() {
                await client.query('BEGIN');
            },
            async commit() {
                await client.query('COMMIT');
            },
            async rollback() {
                await client.query('ROLLBACK');
            },
        };
    },

    async end() {
        await pgPool.end();
    },

    on(eventName, handler) {
        eventHandlers.set(eventName, handler);
        return db;
    },
};

pgPool.on('error', (err) => {
    const handler = eventHandlers.get('error');
    if (typeof handler === 'function') {
        handler(err);
        return;
    }

    console.error('Unexpected Postgres pool error', err);
});

module.exports = db;
