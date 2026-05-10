const { Pool, Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SUPABASE_CONFIG = {
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.xvxjlervjfdituxverlf',
  password: 'a-g4SGTknzENbpu',
  ssl: { rejectUnauthorized: false }
};

async function runMigrationsOnSupabase() {
  console.log('🚀 Starting Supabase database initialization...\n');

  // First, connect to postgres db to create insightforge if needed
  const adminClient = new Client({
    ...SUPABASE_CONFIG,
    database: 'postgres'
  });

  try {
    console.log('🔌 Connecting to Supabase (postgres database)...');
    await adminClient.connect();
    console.log('✅ Connected to Supabase\n');

    // Create insightforge database if it doesn't exist
    console.log('📦 Checking for insightforge database...');
    try {
      await adminClient.query('CREATE DATABASE insightforge');
      console.log('✅ Created insightforge database');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('🗑️  Dropping and recreating insightforge database...');
        try {
          await adminClient.query('DROP DATABASE IF EXISTS insightforge');
          await adminClient.query('CREATE DATABASE insightforge');
          console.log('✅ Database recreated clean');
        } catch (dropErr) {
          console.log('⚠️  Reusing existing database');
        }
      } else {
        throw err;
      }
    }
    console.log('');

    await adminClient.end();

    // Now connect to insightforge db to run migrations
    const pool = new Pool({
      ...SUPABASE_CONFIG,
      database: 'insightforge'
    });

    // Wait for database to be ready
    let retries = 5;
    while (retries > 0) {
      try {
        await pool.query('SELECT 1');
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        console.log('⏳ Waiting for database to be ready...');
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log('🛠️  Applying migrations from database/migrations...');
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql') && !f.includes('master'))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await pool.query(sql);
        console.log(`  ✅ ${file}`);
      } catch (err) {
        console.error(`  ❌ ${file}: ${err.message}`);
      }
    }

    console.log('\n🌱 Applying seed data...');
    const seedPath = path.join(__dirname, '../database/seeds/seed_data.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      try {
        await pool.query(seedSql);
        console.log('✅ Seed data applied\n');
      } catch (err) {
        console.error('❌ Seed error:', err.message, '\n');
      }
    }

    // Verify
    console.log('📊 Database verification:');
    const users = await pool.query('SELECT COUNT(*) as cnt FROM users');
    const surveys = await pool.query('SELECT COUNT(*) as cnt FROM surveys');
    const articles = await pool.query('SELECT COUNT(*) as cnt FROM articles');
    console.log(`  Users: ${users.rows[0].cnt}`);
    console.log(`  Surveys: ${surveys.rows[0].cnt}`);
    console.log(`  Articles: ${articles.rows[0].cnt}`);

    await pool.end();

    console.log('\n🎉 Supabase initialization completed successfully!');
    console.log('✨ Database: insightforge');
    console.log('✨ Host: aws-1-ap-northeast-1.pooler.supabase.com:5432');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runMigrationsOnSupabase();
