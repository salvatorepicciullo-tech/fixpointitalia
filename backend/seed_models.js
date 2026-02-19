const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'fixpoint.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('🌱 Seed MODELS v2...');

  db.get(
    "SELECT id FROM device_types WHERE name='Smartphone'",
    (err, device) => {
      if (err || !device) {
        console.error('❌ Device type Smartphone non trovato');
        return;
      }

      db.get(
        "SELECT id FROM brands WHERE name='Apple'",
        (err, brand) => {
          if (err || !brand) {
            console.error('❌ Brand Apple non trovato');
            return;
          }

          const models = [
            'iPhone 13',
            'iPhone 14',
            'iPhone 15'
          ];

          const stmt = db.prepare(
            'INSERT INTO models (name, device_type_id, brand_id) VALUES (?, ?, ?)'
          );

          models.forEach(name => {
            stmt.run(name, device.id, brand.id);
          });

          stmt.finalize(() => {
            console.log('✅ Modelli Apple inseriti');
          });
        }
      );
    }
  );
});

db.close();
