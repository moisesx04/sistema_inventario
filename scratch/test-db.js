const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
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
