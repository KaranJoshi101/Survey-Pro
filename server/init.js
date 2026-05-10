// Database initialization script (Postgres)
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { spawnSync } = require('child_process');
const { loadEnvironment } = require('./config/loadEnv');

loadEnvironment(path.join(__dirname, '..'));

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

        // Step 1: Ensure database exists
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

        // Step 2: Restore schema/data from dump.sql if available (preferred)
        const dumpPath = path.join(__dirname, '..', 'dump.sql');
        if (fs.existsSync(dumpPath)) {
            console.log('📥 Found dump.sql — attempting restore using psql (if available)...');
            const pgHost = process.env.DB_HOST || 'localhost';
            const pgPort = process.env.DB_PORT || '5432';
            const pgUser = process.env.DB_USER || '';
            const pgPassword = process.env.DB_PASSWORD || '';

            // Try using psql CLI for reliable restore
            try {
                const env = Object.assign({}, process.env, { PGPASSWORD: pgPassword });
                const args = ['-h', pgHost, '-p', String(pgPort), '-U', pgUser, '-d', dbName, '-f', dumpPath];
                const result = spawnSync('psql', args, { stdio: 'inherit', env });
                if (result.status === 0) {
                    console.log('✅ dump.sql restored via psql');
                    console.log('🎉 Database initialization completed successfully!');
                    return;
                }
                console.warn('⚠️  psql restore failed or not available; falling back to running migrations');
            } catch (err) {
                console.warn('⚠️  Could not run psql; falling back to running migrations');
            }
        }

        // Step 3: Fallback — run migration SQL files sequentially
        console.log('🛠️  Applying migrations from database/migrations...');
        const client = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: dbName,
        });

        await client.connect();

        const migrationsDir = path.join(__dirname, '../database/migrations');
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
            const seedsDir = path.join(__dirname, '../database/seeds');
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
