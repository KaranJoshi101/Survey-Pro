// Database initialization script (Postgres)
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const adminConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_ADMIN_DB || 'postgres',
};

const initDatabase = async () => {
    try {
        console.log('🚀 Starting Postgres database initialization...\n');

        const dbName = process.env.DB_NAME || 'insightforge';

        const adminClient = new Client(adminConfig);
        await adminClient.connect();

        const res = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
        if (res.rowCount === 0) {
            console.log(`📦 Creating database '${dbName}'...`);
            await adminClient.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database '${dbName}' created successfully\n`);
        } else {
            console.log(`ℹ️  Database '${dbName}' already exists`);
        }

        await adminClient.end();

        // Apply migrations
        const client = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: dbName,
        });

        await client.connect();

        const migrationsDir = path.join(__dirname, './migrations');
        if (fs.existsSync(migrationsDir)) {
            const files = fs.readdirSync(migrationsDir)
                .filter((f) => f.endsWith('.sql') && f !== 'master_migrations.sql')
                .sort();
            for (const file of files) {
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                console.log(`  ↳ Applying ${file}`);
                await client.query(sql);
            }
            console.log('✅ Migrations applied');
        } else {
            console.log('ℹ️  No migrations directory found — nothing to apply');
        }

        // Optional seeds
        try {
            const seedsDir = path.join(__dirname, './seeds');
            const seedFile = path.join(seedsDir, 'seed_data.sql');
            if (fs.existsSync(seedFile)) {
                console.log('🌱 Applying seed_data.sql');
                const seedSql = fs.readFileSync(seedFile, 'utf8');
                await client.query(seedSql);
                console.log('✅ Seed applied');
            }
        } catch (err) {
            console.warn('⚠️  Error applying seeds:', err.message);
        }

        await client.end();

        console.log('🎉 Database initialization completed successfully!');
        console.log(`✨ Database: ${dbName}`);
        console.log(`✨ Host: ${process.env.DB_HOST}:${process.env.DB_PORT}\n`);
    } catch (err) {
        console.error('❌ Error initializing database:', err?.message || err);
        process.exit(1);
    }
};

initDatabase();
