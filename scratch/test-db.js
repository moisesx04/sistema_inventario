const { Pool } = require('pg');
require('dotenv').config();

const connectionString = "postgresql://postgres:Garusito95%40@aws-0-us-east-1.pooler.supabase.com:6543/postgres";
console.log('Testing connection to:', connectionString.replace(/:([^:@]+)@/, ':****@'));

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error:', err.message);
    console.error('Error code:', err.code);
  } else {
    console.log('Connection successful:', res.rows[0]);
  }
  pool.end();
});
