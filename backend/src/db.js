const { Pool } = require('pg');

let pool;

function getPool() {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });

  return pool;
}

async function verifyConnection() {
  const result = await getPool().query('SELECT NOW()');
  console.log('Database connected successfully at:', result.rows[0].now);
}

module.exports = {
  query: (text, params) => getPool().query(text, params),
  getPool,
  verifyConnection
};
