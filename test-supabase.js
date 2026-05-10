const { Pool } = require('pg');

async function testSupabaseConnection() {
  const pool = new Pool({
    host: 'db.xvxjlervjfdituxverlf.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'a-g4SGTknzENbpu',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Attempting to connect to Supabase...');
    const result = await pool.query('SELECT version()');
    console.log('✅ Connected to Supabase PostgreSQL');
    console.log('📌', result.rows[0].version.split(',')[0]);
    
    const tables = await pool.query('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('📊 Tables in public schema:', tables.rows[0].count);
    
    if (parseInt(tables.rows[0].count) > 0) {
      const tableList = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
      console.log('📋 Existing tables:', tableList.rows.map(r => r.tablename).join(', '));
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
}

testSupabaseConnection();
