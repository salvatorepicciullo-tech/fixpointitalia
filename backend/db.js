const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

const DB_PROVIDER = process.env.DB_PROVIDER || 'sqlite';

let db;

if (DB_PROVIDER === 'postgres') {
  console.log('🔥 USING POSTGRESQL');

  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

} else {
  console.log('🔥 USING SQLITE');

  const dbPath = path.join(__dirname, 'fixpoint.db');
  db = new sqlite3.Database(dbPath);
}

function query(sql, params = []) {
  if (DB_PROVIDER === 'postgres') {
    return db.query(sql, params).then(res => res.rows);
  }

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql, params = []) {
  if (DB_PROVIDER === 'postgres') {
    return db.query(sql, params);
  }

  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

module.exports = { query, run };