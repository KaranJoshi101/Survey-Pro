const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const baseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

const executeSqlSafely = async (conn, sqlScript) => {
    const statements = sqlScript
        .split(/;\s*(?:\r?\n|$)/)
        .map((stmt) => stmt.trim())
        .filter(Boolean);

    for (const statement of statements) {
        try {
            await conn.query(statement);
        } catch (err) {
            const duplicateIndexError = err?.code === 'ER_DUP_KEYNAME' || /Duplicate key name/i.test(err?.message || '');
            if (duplicateIndexError) {
                continue;
            }

            throw err;
        }
    }
};

const normalizeSeedSqlForMySql = (sqlScript) => {
    return String(sqlScript || '')
        .replace(/\bINSERT\s+INTO\b/gi, 'INSERT IGNORE INTO')
        .replace(/CURRENT_TIMESTAMP\s*-\s*INTERVAL\s*'([0-9]+)\s+days'/gi, 'DATE_SUB(CURRENT_TIMESTAMP, INTERVAL $1 DAY)')
        .replace(/CURRENT_TIMESTAMP\s*-\s*INTERVAL\s*'([0-9]+)\s+hours'/gi, 'DATE_SUB(CURRENT_TIMESTAMP, INTERVAL $1 HOUR)')
        .replace(/CURRENT_TIMESTAMP\s*-\s*INTERVAL\s*'([0-9]+)\s+minutes'/gi, 'DATE_SUB(CURRENT_TIMESTAMP, INTERVAL $1 MINUTE)')
        .replace(/\n?\s*ON\s+CONFLICT\s*(?:\([^)]+\))?\s+DO\s+NOTHING;?/gi, ';');
};

const runSeed = async () => {
    try {
        const dbName = process.env.DB_NAME || 'insightforge';
        const conn = await mysql.createConnection({ ...baseConfig, database: dbName });

        const seedPath = path.join(__dirname, './seeds/seed_minimal_valid.sql');
        if (!fs.existsSync(seedPath)) {
            console.error('No seed_minimal_valid.sql found in seeds folder');
            process.exit(1);
        }

        const seedData = normalizeSeedSqlForMySql(fs.readFileSync(seedPath, 'utf8'));
        console.log('Applying seed_minimal_valid.sql...');
        await executeSqlSafely(conn, seedData);
        console.log('Seed applied successfully');

        await conn.end();
    } catch (err) {
        console.error('Error applying seed:', err.message);
        process.exit(1);
    }
};

runSeed();
