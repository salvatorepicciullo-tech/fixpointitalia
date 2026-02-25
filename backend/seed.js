const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'fixpoint.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {

  console.log('🌱 Avvio seed FixPoint...');

  // =========================
  // DEVICE TYPES
  // =========================
  db.run(`INSERT OR IGNORE INTO device_types (id, name, active) VALUES
    (1, 'Smartphone', 1),
    (2, 'Tablet', 1)
  `);

  // =========================
  // BRANDS
  // =========================
  db.run(`INSERT OR IGNORE INTO brands (id, name, active) VALUES
    (1, 'Apple', 1),
    (2, 'Samsung', 1)
  `);

  // =========================
  // MODELS
  // =========================
  db.run(`INSERT OR IGNORE INTO models (id, name, device_type_id, brand_id) VALUES
    (1, 'iPhone 13', 1, 1),
    (2, 'iPhone 14', 1, 1),
    (3, 'Galaxy S22', 1, 2)
  `);

  // =========================
  // REPAIRS
  // =========================
  db.run(`INSERT OR IGNORE INTO repairs (id, name, active) VALUES
    (1, 'Schermo', 1),
    (2, 'Batteria', 1),
    (3, 'Fotocamera', 1)
  `);

  // =========================
  // LISTINO
  // =========================
  db.run(`INSERT OR IGNORE INTO model_repairs (model_id, repair_id, price) VALUES
    (1, 1, 129),
    (1, 2, 79),
    (2, 1, 149),
    (2, 2, 89),
    (3, 1, 139),
    (3, 2, 85)
  `);

  // =========================
  // 🔥 ADMIN USER (LOGIN)
  // password = admin123
  // =========================
  db.run(`
    INSERT OR IGNORE INTO users
    (id, email, password_hash, role, active)
    VALUES
    (
      1,
      'admin@fixpoint.it',
      '$2b$10$WmZ8w9x7Jm0X6uY9o9VYQe6O9hB7gWkC1x3x9q0V3c5G6G3sQf9bK',
      'admin',
      1
    )
  `);

  console.log('✅ Seed completato con successo');

});

db.close();