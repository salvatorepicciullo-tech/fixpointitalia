const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'fixpoint.db');
const db = new sqlite3.Database(dbPath);

db.all(
  "SELECT sql FROM sqlite_master WHERE type='table' AND sql NOT NULL",
  [],
  (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }

    const schema = rows.map(r => r.sql + ';').join('\n\n');

    fs.writeFileSync('schema_sqlite.sql', schema);
    console.log('✅ Schema esportato in schema_sqlite.sql');

    db.close();
  }
);