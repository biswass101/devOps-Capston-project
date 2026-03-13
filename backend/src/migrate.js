const { readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const db = require('./db');

async function runMigrations() {
  const migrationsDir = join(__dirname, '..', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    await db.query(sql);
    console.log(`Applied migration: ${file}`);
  }
}

module.exports = {
  runMigrations
};
