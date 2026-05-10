// Drop and recreate database
const { Client } = require('pg');
const path = require('path');
const { loadEnvironment } = require('./config/loadEnv');

loadEnvironment(path.join(__dirname, '..'));

const adminConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_ADMIN_DB || 'postgres',
};

const dropDb = async () => {
    try {
        const client = new Client(adminConfig);
        await client.connect();

        const dbName = process.env.DB_NAME || 'insightforge';
        console.log(`🗑️  Dropping database '${dbName}' if it exists...`);
        
        // Terminate existing connections and drop
        await client.query(`SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbName}' AND pid <> pg_backend_pid();`);
        await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
        
        console.log(`✅ Database '${dbName}' dropped`);
        await client.end();
    } catch (err) {
        console.error('❌ Error dropping database:', err?.message || err);
        process.exit(1);
    }
};

dropDb();
