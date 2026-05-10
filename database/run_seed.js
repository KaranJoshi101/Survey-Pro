const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const baseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

const runSeed = async () => {
    try {
        const dbName = process.env.DB_NAME || 'insightforge';
        const client = new Client({ ...baseConfig, database: dbName });
        await client.connect();

        const seedPath = path.join(__dirname, './seeds/seed_minimal_valid.sql');
        if (!fs.existsSync(seedPath)) {
            console.error('No seed_minimal_valid.sql found in seeds folder');
            process.exit(1);
        }

        const seedData = fs.readFileSync(seedPath, 'utf8');
        console.log('Applying seed_minimal_valid.sql...');
        await client.query(seedData);
        console.log('Seed applied successfully');

        await client.end();
    } catch (err) {
        console.error('Error applying seed:', err.message);
        process.exit(1);
    }
};

runSeed();
