// Database connection configuration
const { Pool } = require('pg');
require('dotenv').config();

const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const isSslEnabled = parseBoolean(process.env.DB_SSL, false);
const connectionString = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();

const pool = new Pool(
        connectionString
                ? {
                        connectionString,
                        ssl: isSslEnabled
                                ? {
                                        rejectUnauthorized: false,
                                    }
                                : false,
                    }
                : {
                        host: process.env.DB_HOST,
                        port: parseInt(process.env.DB_PORT || '5432', 10),
                        database: process.env.DB_NAME,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        ssl: isSslEnabled
                                ? {
                                        rejectUnauthorized: false,
                                    }
                                : false,
                    }
);

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

module.exports = pool;
