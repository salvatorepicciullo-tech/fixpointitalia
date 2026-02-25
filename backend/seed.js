const bcrypt = require('bcrypt');

module.exports = function (db) {

  db.serialize(() => {

    console.log('🌱 Avvio seed FixPoint...');

    // =========================
    // 🔧 VALUTATION TABLES (FIX ERROR 500)
    // =========================

    db.run(`
      CREATE TABLE IF NOT EXISTS device_base_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER,
        max_value REAL DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS device_defects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        active INTEGER DEFAULT 1
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS device_defect_penalties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER,
        defect_id INTEGER,
        penalty REAL DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS device_valuations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER,
        fixpoint_id INTEGER,
        city TEXT,
        status TEXT DEFAULT 'new',
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS valuation_defects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        valuation_id INTEGER,
        defect_id INTEGER
      )
    `);

    // =========================
    // DEVICE TYPES
    // =========================
    db.run(`
      INSERT OR IGNORE INTO device_types (id,name,active) VALUES
      (1,'Smartphone',1),
      (2,'Tablet',1)
    `);

    // =========================
    // BRANDS
    // =========================
    db.run(`
      INSERT OR IGNORE INTO brands (id,name,active) VALUES
      (1,'Apple',1),
      (2,'Samsung',1)
    `);

    // =========================
    // MODELS
    // =========================
    db.run(`
      INSERT OR IGNORE INTO models (id,name,device_type_id,brand_id) VALUES
      (1,'iPhone 13',1,1),
      (2,'iPhone 14',1,1),
      (3,'Galaxy S22',1,2)
    `);

    // =========================
    // REPAIRS
    // =========================
    db.run(`
      INSERT OR IGNORE INTO repairs (id,name,active) VALUES
      (1,'Schermo',1),
      (2,'Batteria',1),
      (3,'Fotocamera',1)
    `);

    // =========================
    // LISTINO
    // =========================
    db.run(`
      INSERT OR IGNORE INTO model_repairs (model_id,repair_id,price) VALUES
      (1,1,129),
      (1,2,79),
      (2,1,149),
      (2,2,89),
      (3,1,139),
      (3,2,85)
    `);

    // =========================
    // 🔥 ADMIN USER SICURO
    // =========================
    const password = 'admin123';

    bcrypt.hash(password, 10, (err, hash) => {

      if (err) {
        console.log('❌ Errore hash admin:', err);
        return;
      }

      db.run(
        `
        INSERT OR REPLACE INTO users
        (id,email,password_hash,role,active)
        VALUES (1,'admin@fixpoint.it',?,?,1)
        `,
        [hash, 'admin'],
        () => {
          console.log('👑 Admin creato: admin@fixpoint.it / admin123');
        }
      );

    });

    console.log('✅ Seed completato con successo');

  });

};