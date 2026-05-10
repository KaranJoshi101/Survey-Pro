const { Pool, Client } = require('pg');

const SUPABASE_CONFIG = {
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.xvxjlervjfdituxverlf',
  password: 'a-g4SGTknzENbpu',
  ssl: { rejectUnauthorized: false }
};

async function diagnoseDatabase() {
  const adminClient = new Client({
    ...SUPABASE_CONFIG,
    database: 'postgres'
  });

  try {
    console.log('🔍 Diagnosing Supabase database...\n');
    
    await adminClient.connect();
    
    // List all databases
    const dbs = await adminClient.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('📊 Available databases:');
    dbs.rows.forEach(row => console.log('  -', row.datname));
    
    // Check insightforge tables
    console.log('\n🔍 Checking insightforge database...');
    const tables = await adminClient.query(
      "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_catalog = 'insightforge' AND table_schema = 'public'"
    );
    console.log('  Tables in insightforge.public:', tables.rows[0].cnt);
    
    // Check postgres db tables
    console.log('\n🔍 Checking postgres database...');
    const pgTables = await adminClient.query(
      "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_catalog = 'postgres' AND table_schema = 'public'"
    );
    console.log('  Tables in postgres.public:', pgTables.rows[0].cnt);
    
    if (pgTables.rows[0].cnt > 0) {
      const tableList = await adminClient.query(
        "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablecatalog = 'postgres'"
      );
      console.log('  Found tables:', tableList.rows.map(r => r.tablename).join(', '));
    }
    
    await adminClient.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

diagnoseDatabase();
