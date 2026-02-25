const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'fixpoint.db');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'fixpoint_super_secret'; // poi lo spostiamo in env
console.log('🔥 BACKEND FIXPOINT NUOVA VERSIONE CARICATA 🔥');

const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;
const nodemailer = require('nodemailer');
/* =======================
   MAIL CONFIG FIXPOINT
======================= */

const transporter = nodemailer.createTransport({
  host: 'mail.fixpointitalia.com', // 🔥 SMTP Namecheap
  port: 465,
  secure: true,
  auth: {
    user: 'info@fixpointitalia.com',
    pass: process.env.MAIL_PASS // 🔥 NON scrivere password qui
  }
});
/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
// 🔥 SERVE FILE STATICI UPLOAD
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
/* ===============================
   UPLOAD IMMAGINI PROMO
================================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const dir = path.join(__dirname,'uploads');

    if(!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    cb(null,dir);
  },

  filename: (req,file,cb)=>{
    const unique = Date.now() + '-' + file.originalname.replace(/\s/g,'_');
    cb(null,unique);
  }
});

const upload = multer({ storage });

app.use('/uploads',express.static(path.join(__dirname,'uploads')));

/* ROUTE UPLOAD */
app.post('/api/upload',auth,upload.single('file'),(req,res)=>{

  if(req.user.role !== 'admin'){
    return res.status(403).json({error:'Accesso negato'});
  }

  if(!req.file){
    return res.status(400).json({error:'File mancante'});
  }

  res.json({
    url:'/uploads/' + req.file.filename
  });

});


/* =======================
   DATABASE
======================= */
console.log('USING DATABASE FILE:', dbPath);

const db = new sqlite3.Database(dbPath, err => {
  if (err) {
    console.error('Errore DB:', err.message);
  } else {
    db.configure('busyTimeout', 5000);
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    console.log('Database collegato correttamente ✅');
    initDatabase();
  }
});

function initDatabase() {

  db.serialize(() => {

    console.log('⚙️ Init database...');

    const tables = [

      'CREATE TABLE IF NOT EXISTS device_types (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, active INTEGER DEFAULT 1)',
      'CREATE TABLE IF NOT EXISTS brands (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, active INTEGER DEFAULT 1)',
      'CREATE TABLE IF NOT EXISTS models (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, device_type_id INTEGER, brand_id INTEGER)',
      'CREATE TABLE IF NOT EXISTS repairs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, active INTEGER DEFAULT 1)',
      'CREATE TABLE IF NOT EXISTS model_repairs (id INTEGER PRIMARY KEY AUTOINCREMENT, model_id INTEGER, repair_id INTEGER, price REAL)',

      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT,
        fixpoint_id INTEGER,
        active INTEGER DEFAULT 1
      )`,

      `CREATE TABLE IF NOT EXISTS fixpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        city TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        vat_number TEXT,
        price_percent INTEGER DEFAULT 0,
        lat REAL,
        lng REAL,
        active INTEGER DEFAULT 1
      )`,

      `CREATE TABLE IF NOT EXISTS device_valuations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER,
        city TEXT,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        fixpoint_id INTEGER,
        status TEXT DEFAULT 'NEW',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS valuation_defects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        valuation_id INTEGER,
        defect_id INTEGER
      )`,

      `CREATE TABLE IF NOT EXISTS fixpoint_brand_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fixpoint_id INTEGER NOT NULL,
        brand_id INTEGER NOT NULL,
        price_percent INTEGER DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_id INTEGER,
        fixpoint_id INTEGER,
        price REAL,
        city TEXT,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        description TEXT,
        status TEXT DEFAULT 'NEW',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS quote_repairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER,
        repair_id INTEGER
      )`,

      `CREATE TABLE IF NOT EXISTS promos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        image_url TEXT,
        is_hero INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1
      )`

    ];

    // CREA TUTTE LE TABELLE
    tables.forEach(sql => db.run(sql));

    console.log('✅ Tabelle assicurate');

    // ALTER SAFE
    db.run(`ALTER TABLE repairs ADD COLUMN device_type_id INTEGER`,()=>{});
    db.run(`ALTER TABLE quotes ADD COLUMN description TEXT`,()=>{});
    db.run(`ALTER TABLE fixpoints ADD COLUMN price_percent INTEGER DEFAULT 0`,()=>{});
    db.run(`ALTER TABLE promos ADD COLUMN image_url TEXT`,()=>{});
    db.run(`ALTER TABLE promos ADD COLUMN description TEXT`,()=>{});
    db.run(`ALTER TABLE promos ADD COLUMN is_hero INTEGER DEFAULT 0`,()=>{});

    console.log('🧩 Alter safe completati');

  // ✅ SEED SOLO SE DB VUOTO (FIX DEFINITIVO)
db.get('SELECT COUNT(*) as total FROM device_types', (err,row)=>{

  if(err){
    console.log('Errore check seed',err);
    return;
  }

  if(!row || row.total === 0){

    console.log('🌱 Avvio seed FixPoint (prima installazione)...');
    require('./seed')(db);

  }else{

    console.log('✅ Seed saltato (DB già popolato)');

  }

});

  });

}




/* =======================
   AUTH MIDDLEWARE (JWT)
======================= */
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  const token = header.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded = { id, role, fixpoint_id }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token non valido' });
  }
}

/* ===============================
   PROMO HOMEPAGE API
================================ */

// GET PROMOS
app.get('/api/promos', (req, res) => {
  db.all(
    'SELECT * FROM promos WHERE active = 1 ORDER BY id DESC',
    [],
    (err, rows) => {
      if (err) {
        console.error('Errore GET promos', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

// ADMIN LIST (tutte)
app.get('/api/admin/promos', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.all(
    'SELECT * FROM promos ORDER BY id DESC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json([]);
      res.json(rows);
    }
  );
});

// CREATE PROMO
app.post('/api/admin/promos', auth, (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const { title } = req.body;

  db.run(
    'INSERT INTO promos (title, active) VALUES (?,1)',
    [title],
    function (err) {
      if (err) {
        console.error('Errore create promo', err);
        return res.status(500).json({});
      }
      res.json({ id: this.lastID });
    }
  );
});

// TOGGLE PROMO
app.put('/api/admin/promos/:id', auth, (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const { active } = req.body;

  db.run(
    'UPDATE promos SET active=? WHERE id=?',
    [active, req.params.id],
    function (err) {
      if (err) return res.status(500).json({});
      res.json({ success: true });
    }
  );
});

// DELETE PROMO
app.delete('/api/admin/promos/:id', auth, (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.run(
    'DELETE FROM promos WHERE id=?',
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({});
      res.json({ success: true });
    }
  );
});




// 🔥 UPLOAD PROMO (QUESTA TI MANCAVA)
app.post('/api/admin/promos/upload', auth, upload.single('image'), (req,res)=>{

  if(req.user.role !== 'admin'){
    return res.status(403).json({error:'Accesso negato'});
  }

  const { title } = req.body;

  if(!req.file){
    return res.status(400).json({error:'File mancante'});
  }

  const image_url = `/uploads/${req.file.filename}`;

  db.run(
    'INSERT INTO promos (title,image_url,active) VALUES (?,?,1)',
    [title,image_url],
    function(err){

      if(err){
        console.log(err);
        return res.status(500).json({});
      }

      res.json({
        id:this.lastID,
        title,
        image_url,
        active:1
      });

    }
  );

});

/* =======================
   DEVICE TYPES (FIX DEFINITIVO)
======================= */

// LIST
app.get('/api/device-types', (req, res) => {
  db.serialize(() => {
    db.all(
      `SELECT id, name, active
       FROM device_types
       WHERE active = 1
       ORDER BY name`,
      [],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json([]);
        }
        res.json(rows || []);
      }
    );
  });
});

// CREATE
app.post('/api/device-types', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Nome obbligatorio' });
  }

  db.serialize(() => {
    db.run(
      `INSERT INTO device_types (name, active)
       VALUES (?,1)`,
      [name],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: true });
        }

        db.get(
          `SELECT id, name, active
           FROM device_types
           WHERE id = ?`,
          [this.lastID],
          (_, row) => res.json(row)
        );
      }
    );
  });
});

// UPDATE
app.put('/api/device-types/:id', (req, res) => {
  const { name } = req.body;

  db.serialize(() => {
    db.run(
      `UPDATE device_types
       SET name = ?
       WHERE id = ?`,
      [name, req.params.id],
      function (err) {
        if (err) return res.status(500).json({});
        res.json({ success: true });
      }
    );
  });
});

// DELETE (SOFT DELETE SEMPRE)
app.delete('/api/device-types/:id', (req, res) => {
  db.serialize(() => {
    db.run(
      `UPDATE device_types
       SET active = 0
       WHERE id = ?`,
      [req.params.id],
      function (err) {
        if (err) return res.status(500).json({});
        res.json({ success: true });
      }
    );
  });
});


/* =======================
   BRANDS
======================= */
app.get('/api/brands', (req, res) => {
  db.all(
    'SELECT id, name, active FROM brands ORDER BY name',
    [],
    (err, rows) => err ? res.status(500).json([]) : res.json(rows)
  );
});

app.post('/api/brands', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Nome obbligatorio' });

  db.get(
    'SELECT id, active FROM brands WHERE LOWER(name)=LOWER(?)',
    [name],
    (err, row) => {
      if (row && row.active === 0)
        return db.run(
          'UPDATE brands SET active=1 WHERE id=?',
          [row.id],
          () => res.json({ success: true, reactivated: true })
        );
      if (row) return res.status(409).json({ error: 'Marca già esistente' });

      db.run(
        'INSERT INTO brands (name, active) VALUES (?,1)',
        [name],
        function () {
          res.json({ success: true, id: this.lastID });
        }
      );
    }
  );
});

app.put('/api/brands/:id', (req, res) => {
  db.run(
    'UPDATE brands SET name=? WHERE id=?',
    [req.body.name, req.params.id],
    function () {
      this.changes ? res.json({ success: true }) : res.status(404).json({});
    }
  );
});

app.delete('/api/brands/:id', (req, res) => {
  db.get(
    'SELECT COUNT(*) cnt FROM models WHERE brand_id=?',
    [req.params.id],
    (err, row) => {
      if (row.cnt > 0)
        return db.run(
          'UPDATE brands SET active=0 WHERE id=?',
          [req.params.id],
          () => res.json({ success: true, disabled: true })
        );
      db.run(
        'DELETE FROM brands WHERE id=?',
        [req.params.id],
        () => res.json({ success: true })
      );
    }
  );
});

/* =======================
   MODELS
======================= */
app.get('/api/models', (req, res) => {
  const { device_type_id, brand_id } = req.query;
  if (!device_type_id || !brand_id) return res.json([]);
  db.all(
    'SELECT id, name FROM models WHERE device_type_id=? AND brand_id=? ORDER BY name',
    [device_type_id, brand_id],
    (err, rows) => err ? res.status(500).json([]) : res.json(rows)
  );
});

app.post('/api/models', (req, res) => {
  const { name, device_type_id, brand_id } = req.body;

  if (!name || !device_type_id || !brand_id)
    return res.status(400).json({ error: 'Dati mancanti' });

  db.get(
    'SELECT id FROM models WHERE LOWER(name)=LOWER(?) AND device_type_id=? AND brand_id=?',
    [name.trim(), device_type_id, brand_id],
    (err, row) => {

      if (row)
        return res.status(409).json({ error: 'Modello già esistente' });

      // ✅ CREA MODELLO
      db.run(
        'INSERT INTO models (name, device_type_id, brand_id) VALUES (?,?,?)',
        [name.trim(), device_type_id, brand_id],
        function () {

      const newModelId = this.lastID;

// 🔥 AUTO INSERIMENTO RIPARAZIONI GLOBALI (COME PRIMA)
db.all(
  'SELECT id FROM repairs WHERE active = 1',
  [],
  (err2, repairs) => {

    if (!err2 && repairs && repairs.length) {

      const stmt = db.prepare(
        'INSERT INTO model_repairs (model_id, repair_id, price) VALUES (?,?,0)'
      );

      repairs.forEach(r => {
        stmt.run(newModelId, r.id);
      });

      stmt.finalize();
    }

    res.json({ success: true, id: newModelId });

  }
);


        }
      );

    }
  );
});


// GET SINGLE MODEL (brand_id necessario per percentuali)
app.get('/api/model/:id', (req, res) => {

  db.get(
    'SELECT id, brand_id FROM models WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({});
      }

      res.json(row);
    }
  );

});


app.put('/api/models/:id', (req, res) => {
  db.run(
    'UPDATE models SET name=? WHERE id=?',
    [req.body.name, req.params.id],
    function () {
      this.changes ? res.json({ success: true }) : res.status(404).json({});
    }
  );
});

app.delete('/api/models/:id', (req, res) => {
  db.get(
    'SELECT COUNT(*) cnt FROM model_repairs WHERE model_id=?',
    [req.params.id],
    (err, row) => {
      if (row.cnt > 0)
        return res.status(409).json({ error: 'Modello usato nel listino' });
      db.run(
        'DELETE FROM models WHERE id=?',
        [req.params.id],
        () => res.json({ success: true })
      );
    }
  );
});

/* =======================
   ADMIN – IMPORT TEMPLATE REPAIRS
======================= */

app.post('/api/admin/import-repair-template', (req, res) => {

  const templates = {

    // 📱 SMARTPHONE (id = 3 nel tuo DB)
    3: [
      'Sostituzione display',
      'Sostituzione Batteria',
      'Sostituzione Connettore Carica',
      'Sostituzione microfono',
      'Sostituzione altoparlante',
      'Sostituzione Suoneria',
      'Sostituzione fotocamera anteriore',
      'Sostituzione fotocamera posteriore',
      'Sostituzione vetro posteriore',
      'Sostituzione vetrini fotocamera',
      'Diagnosi',
      'Passaggio dati'
    ],

    // ⌚ SMARTWATCH
    4: [
      'Sostituzione display',
      'Sostituzione Batteria',
      'Sostituzione vetro',
      'Diagnosi'
    ],

    // 📲 TABLET
    5: [
      'Sostituzione display',
      'Sostituzione touch',
      'Sostituzione Batteria',
      'Sostituzione Connettore Carica',
      'Diagnosi'
    ],

    // 💻 COMPUTER
    1: [
      'Sostituzione SSD',
      'Upgrade RAM',
      'Sostituzione Tastiera',
      'Pulizia interna',
      'Cambio pasta termica',
      'Diagnosi'
    ]

  };

  let inserted = 0;
  let skipped = 0;

  db.serialize(() => {

    Object.entries(templates).forEach(([deviceTypeId, repairs]) => {

      repairs.forEach(name => {

        db.get(
          'SELECT id FROM repairs WHERE LOWER(name)=LOWER(?) AND device_type_id=?',
          [name, deviceTypeId],
          (err, row) => {

            if (row) {
              skipped++;
            } else {
              db.run(
                'INSERT INTO repairs (name, active, device_type_id) VALUES (?,1,?)',
                [name, deviceTypeId]
              );
              inserted++;
            }

          }
        );

      });

    });

  });

  setTimeout(() => {
    res.json({ success:true, inserted, skipped });
  }, 500);

});

/* =======================
   REPAIRS
======================= */

app.get('/api/repairs', (req, res) => {

  // 🔥 LISTA RIPARAZIONI GLOBALE (UGUALE PER TUTTI I DISPOSITIVI)
  db.all(
    `
    SELECT id, name, active
    FROM repairs
    WHERE active = 1
    ORDER BY name
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );

});


app.post('/api/repairs', (req, res) => {

  const name = (req.body.name || '').trim();
  const device_type_id = req.body.device_type_id;

  if (!name) {
    return res.status(400).json({ error: 'Nome obbligatorio' });
  }

  db.get(
    'SELECT id, active FROM repairs WHERE LOWER(name)=LOWER(?) AND device_type_id=?',
    [name, device_type_id],
    (err, row) => {

      if (row && row.active === 0) {
        return db.run(
          'UPDATE repairs SET active=1 WHERE id=?',
          [row.id],
          () => res.json({ success: true, reactivated: true })
        );
      }

      if (row) {
        return res.status(409).json({ error: 'Riparazione già esistente' });
      }

      db.run(
        'INSERT INTO repairs (name, active, device_type_id) VALUES (?,1,?)',
        [name, device_type_id],
        function () {
          res.json({ success: true, id: this.lastID });
        }
      );

    }
  );
});


app.put('/api/repairs/:id', (req, res) => {
  db.run(
    'UPDATE repairs SET name=? WHERE id=?',
    [req.body.name, req.params.id],
    function () {
      this.changes
        ? res.json({ success: true })
        : res.status(404).json({});
    }
  );
});


app.delete('/api/repairs/:id', (req, res) => {

  db.get(
    'SELECT COUNT(*) cnt FROM model_repairs WHERE repair_id=?',
    [req.params.id],
    (err, row) => {

      if (row && row.cnt > 0) {
        return db.run(
          'UPDATE repairs SET active=0 WHERE id=?',
          [req.params.id],
          () => res.json({ success: true, disabled: true })
        );
      }

      db.run(
        'DELETE FROM repairs WHERE id=?',
        [req.params.id],
        () => res.json({ success: true })
      );

    }
  );

});

/* =======================
   ADMIN – FIXPOINTS LIST
======================= */
app.get('/api/admin/fixpoints', (req, res) => {
  const { status } = req.query;

  let where = '';
  if (status === 'active') where = 'WHERE f.active = 1';
  if (status === 'inactive') where = 'WHERE f.active = 0';

  const sql = `
    SELECT
      f.id,
      f.name,
      f.city,
      f.address,
      f.phone,
      f.email,
      f.vat_number,	
      f.active,
      u.id AS user_id,
      u.email AS username
    FROM fixpoints f
    LEFT JOIN users u
      ON u.fixpoint_id = f.id
      AND u.role = 'fixpoint'
    ${where}
    ORDER BY f.city, f.name
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Errore GET admin fixpoints', err);
      return res.status(500).json([]);
    }
    res.json(rows);
  });
});




/* =======================
   FIXPOINTS
======================= */

// LIST
app.get('/api/fixpoints', (req, res) => {
  db.all(
  `
  SELECT id, name, city, address, phone, email, price_percent
  FROM fixpoints
  WHERE active = 1
  ORDER BY city, name
  `,

    [],
    (err, rows) => err ? res.status(500).json([]) : res.json(rows)
  );
});

// FIXPOINT DISPONIBILI PER CITTÀ (CLIENTE)
app.get('/api/fixpoints/by-city', (req, res) => {
  const { city } = req.query;
  if (!city) return res.json([]);

  db.all(
    `
    SELECT id, name, address, price_percent
    FROM fixpoints
    WHERE active = 1
      AND LOWER(city) = LOWER(?)
    ORDER BY name
    `,
    [city],
    (err, rows) => {
      if (err) {
        console.error('Errore fixpoints by city', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});


// CREATE
app.post('/api/fixpoints', async (req, res) => {

  const { name, city, address, phone, email, price_percent } = req.body;

  if (!name || !city) {
    return res.status(400).json({ error: 'Nome e città obbligatori' });
  }

  try {

    // 🔥 GEOLOCALIZZA AUTOMATICAMENTE LA CITTÀ
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&q=${encodeURIComponent(city)}`
    );

    const geoData = await geoRes.json();

    let lat = null;
    let lng = null;

    if (geoData && geoData.length) {
      lat = geoData[0].lat;
      lng = geoData[0].lon;
    }

    // 🔥 SALVA FIXPOINT CON LAT/LNG AUTOMATICI
    db.run(
      `
      INSERT INTO fixpoints
      (name, city, address, phone, email, price_percent, lat, lng, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        name,
        city,
        address || null,
        phone || null,
        email || null,
        price_percent || 0,
        lat,
        lng
      ],
      function (err) {

        if (err) {
          console.error(err);
          return res.status(500).json({ error: err.message });
        }

        res.json({
          success: true,
          id: this.lastID,
          lat,
          lng
        });

      }
    );

  } catch (e) {
    console.error('Errore geocoding:', e);
    res.status(500).json({ error: 'Errore geocoding città' });
  }

});


// UPDATE
app.put('/api/fixpoints/:id', (req, res) => {
  const { name, city, address, phone, email, vat_number, price_percent } = req.body;


  if (!name || !city) {
    return res.status(400).json({ error: 'Nome e città obbligatori' });
  }

  db.run(
    `
    UPDATE fixpoints
    SET name = ?, city = ?, address = ?, phone = ?, email = ?, price_percent = ?

    WHERE id = ?
    `,
    [name, city, address || null, phone || null, email || null, price_percent || 0, req.params.id]
,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// FIXPOINTS PER RAGGIO KM (PRO VERSION DISTANZA AUTO)
app.get('/api/fixpoints/nearby', (req, res) => {

  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.json([]);
  }

  const R = 6371;

  const sql = `
  SELECT *
  FROM (
    SELECT
      id,
      name,
      address,
      city,
      price_percent,
      lat,
      lng,
      (
        ${R} * acos(
          cos(radians(?)) *
          cos(radians(lat)) *
          cos(radians(lng) - radians(?)) +
          sin(radians(?)) *
          sin(radians(lat))
        )
      ) AS distance
    FROM fixpoints
    WHERE active = 1
      AND lat IS NOT NULL
      AND lng IS NOT NULL
  )
  WHERE distance <= 50   -- 🔥 V3 aumenta raggio intelligente
  ORDER BY distance ASC
  LIMIT 10               -- 🔥 sicurezza performance
  `;

  db.all(sql, [lat, lng, lat], (err, rows) => {

    if (err) {
      console.error('Errore fixpoints nearby', err);
      return res.status(500).json([]);
    }

    // 🔥 AUTO GEO SMART V3
    if (!rows || rows.length === 0) {
      console.log('⚠️ Nessun fixpoint entro raggio → fallback automatico');

      db.all(
        `
        SELECT id, name, address, city, price_percent, lat, lng, 999 AS distance
        FROM fixpoints
        WHERE active = 1
        ORDER BY id ASC
        LIMIT 5
        `,
        [],
        (_, fallback) => res.json(fallback || [])
      );

      return;
    }

    res.json(rows);
  });

});

/* =======================
   FIXPOINT BRAND PERCENT (SMART ENGINE)
======================= */

app.get('/api/fixpoints/:fixpoint_id/brand-percent/:brand_id', (req, res) => {

  const { fixpoint_id, brand_id } = req.params;

  // 1️⃣ percentuale base fixpoint
  db.get(
    'SELECT price_percent FROM fixpoints WHERE id = ?',
    [fixpoint_id],
    (err1, fp) => {

      if (err1) {
        console.error(err1);
        return res.status(500).json({ percent: 0 });
      }

      const basePercent = fp?.price_percent || 0;

      // 2️⃣ percentuale specifica brand
      db.get(
        `
        SELECT price_percent
        FROM fixpoint_brand_rules
        WHERE fixpoint_id = ?
          AND brand_id = ?
        `,
        [fixpoint_id, brand_id],
        (err2, rule) => {

          if (err2) {
            console.error(err2);
            return res.status(500).json({ percent: basePercent });
          }

          const brandPercent = rule?.price_percent || 0;

          const totalPercent = basePercent + brandPercent;

          res.json({
            percent: totalPercent,
            base: basePercent,
            brand: brandPercent
          });
        }
      );

    }
  );

});

// GET USER FIXPOINT (ADMIN)
app.get('/api/admin/fixpoints/:id/user', (req, res) => {
  const fixpointId = req.params.id;

  db.get(
    `
    SELECT id, email
    FROM users
    WHERE fixpoint_id = ?
      AND role = 'fixpoint'
      AND active = 1
    `,
    [fixpointId],
    (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Errore server' });
      }

      if (!user) return res.json(null);

      res.json(user);
    }
  );
});


// DELETE (safe)
app.put('/api/fixpoints/:id/disable', (req, res) => {
  const fixpointId = req.params.id;

  db.run(
    'UPDATE fixpoints SET active = 0 WHERE id = ?',
    [fixpointId],
    function (err) {
      if (err) {
        console.error('Errore disattivazione fixpoint', err);
        return res.status(500).json({ error: 'Errore server' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'FixPoint non trovato' });
      }

      res.json({ success: true });
    }
  );
});

// RIATTIVA FIXPOINT
app.put('/api/fixpoints/:id/enable', (req, res) => {
  const fixpointId = req.params.id;

  db.run(
    'UPDATE fixpoints SET active = 1 WHERE id = ?',
    [fixpointId],
    function (err) {
      if (err) {
        console.error('Errore riattivazione fixpoint', err);
        return res.status(500).json({ error: 'Errore server' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'FixPoint non trovato' });
      }

      res.json({ success: true });
    }
  );
});


/* =======================
   ADMIN – FIXPOINT BRAND RULES
======================= */

// LIST BRAND RULES PER FIXPOINT
app.get('/api/admin/fixpoints/:id/brand-rules', auth, (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const fixpointId = req.params.id;

  db.all(
    `
    SELECT
      b.id AS brand_id,
      b.name AS brand,
      IFNULL(r.price_percent,0) AS price_percent
    FROM brands b
    LEFT JOIN fixpoint_brand_rules r
      ON r.brand_id = b.id
     AND r.fixpoint_id = ?
    ORDER BY b.name
    `,
    [fixpointId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );

});

// SAVE / UPDATE BRAND RULE
app.post('/api/admin/fixpoints/:id/brand-rules', auth, (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const fixpointId = req.params.id;
  const { brand_id, price_percent } = req.body;

  if (!brand_id) {
    return res.status(400).json({ error: 'Brand mancante' });
  }

  db.get(
    `
    SELECT id FROM fixpoint_brand_rules
    WHERE fixpoint_id = ?
      AND brand_id = ?
    `,
    [fixpointId, brand_id],
    (err, row) => {

      if (row) {
        db.run(
          `
          UPDATE fixpoint_brand_rules
          SET price_percent = ?
          WHERE id = ?
          `,
          [price_percent || 0, row.id],
          () => res.json({ success:true, updated:true })
        );
      } else {
        db.run(
          `
          INSERT INTO fixpoint_brand_rules
          (fixpoint_id, brand_id, price_percent)
          VALUES (?, ?, ?)
          `,
          [fixpointId, brand_id, price_percent || 0],
          () => res.json({ success:true, created:true })
        );
      }

    }
  );

});



/* =======================
   ADMIN – VALUTAZIONI
======================= */
app.get('/api/admin/valuations', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.all(
`
SELECT
  dv.id,
  dv.city,
  dv.status,
  dv.created_at,
  dv.customer_name,
  dv.customer_email,
  dv.customer_phone,
  m.name AS model,
  f.name AS fixpoint,
  bv.max_value,

  IFNULL((
    SELECT SUM(dp.penalty)
    FROM valuation_defects vd2
    LEFT JOIN device_defect_penalties dp
      ON dp.defect_id = vd2.defect_id
     AND dp.model_id = dv.model_id
    WHERE vd2.valuation_id = dv.id
  ),0) AS total_penalty,

  (bv.max_value - IFNULL((
    SELECT SUM(dp.penalty)
    FROM valuation_defects vd2
    LEFT JOIN device_defect_penalties dp
      ON dp.defect_id = vd2.defect_id
     AND dp.model_id = dv.model_id
    WHERE vd2.valuation_id = dv.id
  ),0)) AS final_value,

  (
    SELECT GROUP_CONCAT(d.name || '|' || dp.penalty)
    FROM valuation_defects vd3
    JOIN device_defects d ON d.id = vd3.defect_id
    JOIN device_defect_penalties dp
      ON dp.defect_id = d.id
     AND dp.model_id = dv.model_id
    WHERE vd3.valuation_id = dv.id
  ) AS defects

FROM device_valuations dv
LEFT JOIN models m ON m.id = dv.model_id
LEFT JOIN fixpoints f ON f.id = dv.fixpoint_id
LEFT JOIN device_base_values bv ON bv.model_id = dv.model_id
ORDER BY dv.created_at DESC
`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Errore GET admin valuations', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

/* =======================
   ADMIN – DELETE VALUATION
======================= */
app.delete('/api/admin/valuations/:id', auth, (req, res) => {

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.run(
    'DELETE FROM device_valuations WHERE id = ?',
    [req.params.id],
    function(err) {

      if (err) {
        console.error('Errore delete valuation', err);
        return res.status(500).json({ error: 'Errore DB' });
      }

      res.json({ success: true });
    }
  );

});


/* =======================
   VALUTAZIONI – PUBBLICO
======================= */
app.post('/api/valuations', (req, res) => {

  const {
    model_id,
    city,
    customer_name,
    customer_email,
    customer_phone,
    defect_ids = [],
    fixpoint_id
  } = req.body;

  if (!model_id || !city) {
    return res.status(400).json({ error: 'Dati obbligatori mancanti' });
  }

  const insertValuation = (fixpointIdFinal) => {

    db.run(
      `
      INSERT INTO device_valuations
      (
        model_id,
        city,
        customer_name,
        customer_email,
        customer_phone,
        fixpoint_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'NEW')
      `,
      [
        model_id,
        city,
        customer_name || null,
        customer_email || null,
        customer_phone || null,
        fixpointIdFinal || null
      ],
      function (err) {

        if (err) {
          console.error('Errore INSERT valuation:', err);
          return res.status(500).json({ error: 'Errore database' });
        }

        const valuationId = this.lastID;

        if (Array.isArray(defect_ids) && defect_ids.length) {

          const stmt = db.prepare(
            'INSERT INTO valuation_defects (valuation_id, defect_id) VALUES (?, ?)'
          );

          defect_ids.forEach(did => stmt.run(valuationId, did));

          stmt.finalize(() => {
            res.json({ success: true, valuation_id: valuationId });
          });

        } else {
          res.json({ success: true, valuation_id: valuationId });
        }

      }
    );
  };

  // ✅ SE SCELTO MANUALMENTE
  if (fixpoint_id) {
    return insertValuation(fixpoint_id);
  }

  // 🔵 AUTO ASSEGNA PER CITTÀ
 // 🔥 NORMALIZZA CITTA (Reggio nell'Emilia = Reggio Emilia)
const normalizeCity = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/nell'/g, ' ')
    .replace(/di /g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

db.get(
  `
  SELECT id
  FROM fixpoints
  WHERE active = 1
    AND REPLACE(REPLACE(LOWER(city),'nell''',' '),'di ',' ')
        LIKE '%' || ? || '%'
  ORDER BY id ASC
  LIMIT 1
  `,
  [ normalizeCity(city) ],
  (errFix, fp) => {


      const autoFixpointId = fp ? fp.id : null;

      insertValuation(autoFixpointId);

    }
  );

});
/* =======================
   VALUTAZIONI – FIXPOINT
======================= */



/* =======================
   FIXPOINT – VALUTAZIONI
======================= */
app.get('/api/fixpoint/valuations', auth, (req, res) => {
  if (req.user.role !== 'fixpoint') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const fixpointId = req.user.fixpoint_id;

  db.all(
`
SELECT
  dv.id,
  dv.city,
  dv.status,
  dv.created_at,
  dv.customer_name,
  dv.customer_email,
  dv.customer_phone,
  m.name AS model,
  bv.max_value,

  IFNULL((
    SELECT SUM(dp.penalty)
    FROM valuation_defects vd2
    LEFT JOIN device_defect_penalties dp
      ON dp.defect_id = vd2.defect_id
     AND dp.model_id = dv.model_id
    WHERE vd2.valuation_id = dv.id
  ),0) AS total_penalty,

  (bv.max_value - IFNULL((
    SELECT SUM(dp.penalty)
    FROM valuation_defects vd2
    LEFT JOIN device_defect_penalties dp
      ON dp.defect_id = vd2.defect_id
     AND dp.model_id = dv.model_id
    WHERE vd2.valuation_id = dv.id
  ),0)) AS final_value,

  (
    SELECT GROUP_CONCAT(d.name || '|' || dp.penalty)
    FROM valuation_defects vd3
    JOIN device_defects d ON d.id = vd3.defect_id
    JOIN device_defect_penalties dp
      ON dp.defect_id = d.id
     AND dp.model_id = dv.model_id
    WHERE vd3.valuation_id = dv.id
  ) AS defects

FROM device_valuations dv
LEFT JOIN models m ON m.id = dv.model_id
LEFT JOIN device_base_values bv ON bv.model_id = dv.model_id
WHERE dv.fixpoint_id = ?
ORDER BY dv.created_at DESC
`,
    [fixpointId],
    (err, rows) => {
      if (err) {
        console.error('Errore GET fixpoint valuations', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

/* ===============================
   FIXPOINT – UPDATE VALUATION STATUS
================================= */
app.put('/api/fixpoint/valuations/:id/status', auth, (req, res) => {

  if (req.user.role !== 'fixpoint') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const valuationId = req.params.id;
  const { status } = req.body;

  // 🔒 sequenza professionale stati
  const allowed = ['NEW','IN_CONTACT','CLOSED'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Stato non valido' });
  }

  db.get(
    'SELECT status, fixpoint_id FROM device_valuations WHERE id = ?',
    [valuationId],
    (err, row) => {

      if (err || !row) {
        return res.status(404).json({ error: 'Valutazione non trovata' });
      }

      // 🔒 fixpoint può modificare solo le sue
      if (row.fixpoint_id !== req.user.fixpoint_id) {
        return res.status(403).json({ error: 'Non assegnata a te' });
      }

      const current = row.status;

      // 🔒 sequenza: NEW → IN_CONTACT → CLOSED
      const allowedTransition =
        (current === 'NEW' && status === 'IN_CONTACT') ||
        (current === 'IN_CONTACT' && status === 'CLOSED');

      if (!allowedTransition) {
        return res.status(403).json({ error: 'Transizione non consentita' });
      }

      db.run(
        'UPDATE device_valuations SET status = ? WHERE id = ?',
        [status, valuationId],
        function(err2) {

          if (err2) {
            console.error(err2);
            return res.status(500).json({ error:'Errore DB' });
          }

          res.json({ success:true });
        }
      );
    }
  );
});





/* =======================
   LISTINO (MODEL_REPAIRS)
======================= */

// LIST by model
app.get('/api/model-repairs', (req, res) => {

  const { model_id } = req.query;
  if (!model_id) return res.json([]);

  db.all(
    `
    SELECT
      mr.id,
      mr.price,
      r.id AS repair_id,
      r.name AS repair
    FROM model_repairs mr
    JOIN repairs r ON r.id = mr.repair_id
    JOIN models m ON m.id = mr.model_id
    WHERE mr.model_id = ?
    ORDER BY r.name
    `,
    [model_id],
    (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );

});


// CREATE or UPDATE
app.post('/api/model-repairs', (req, res) => {

  const { model_id, repair_id, price } = req.body;

  if (!model_id || !repair_id || price === undefined) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  db.get(
    'SELECT id FROM model_repairs WHERE model_id=? AND repair_id=?',
    [model_id, repair_id],
    (err, row) => {

      if (err) {
        console.log(err);
        return res.status(500).json({ error: true });
      }

      if (row) {

        // 🔥 aggiorna SOLO quella riga
        db.run(
          'UPDATE model_repairs SET price=? WHERE id=?',
          [price, row.id],
          err => {
            if (err) console.log(err);
            res.json({ success: true, updated: true });
          }
        );

      } else {

        db.run(
          'INSERT INTO model_repairs (model_id, repair_id, price) VALUES (?,?,?)',
          [model_id, repair_id, price],
          err => {
            if (err) console.log(err);
            res.json({ success: true, created: true });
          }
        );

      }

    }
  );
});


// DELETE UNA SOLA RIGA
app.delete('/api/model-repairs/:id', (req, res) => {

  db.run(
    'DELETE FROM model_repairs WHERE id=?',
    [req.params.id],
    function(err) {

      if (err) {
        console.log(err);
        return res.status(500).json({ error: true });
      }

      res.json({ success: true });
    }
  );

});
/* =======================
   QUOTES (PREVENTIVI)
======================= */
app.post('/api/quotes', (req, res) => {

  // ============================
  // ⭐ SUPPORTO "ALTRA MARCA"
  // ============================
  const {
    is_custom_request,
    description,
    fixpoint_id: custom_fixpoint_id,
    city,
    customer_name,
    customer_email,
    customer_phone
  } = req.body;

  // 🔵 FLOW RICHIESTA LIBERA
  if (is_custom_request) {

    if (!custom_fixpoint_id || !description) {
      return res.status(400).json({ error: 'Richiesta libera incompleta' });
    }

    db.run(
      `
     INSERT INTO quotes
(
  model_id,
  fixpoint_id,
  price,
  city,
  customer_name,
  customer_email,
  customer_phone,
  description,
  status
)


      VALUES (NULL, ?, 0, ?, ?, ?, ?, ?, 'ASSIGNED')

      `,
      [
  custom_fixpoint_id,
  city || '',
  customer_name || '',
  customer_email || '',
  customer_phone || '',
  description || ''
]
,
      function(err) {

        if (err) {
          console.error('Errore INSERT richiesta libera', err);
          return res.status(500).json({ error: 'Errore DB' });
        }

        const quoteId = this.lastID;

        db.run(
          `INSERT INTO quote_repairs (quote_id, repair_id) VALUES (?, NULL)`,
          [quoteId],
          () => {
            return res.json({ success: true, quote_id: quoteId });
          }
        );

      }
    );

    return;
  }

  // ============================
  // ⭐ PREVENTIVO NORMALE
  // ============================
  const {
    model_id,
    repair_ids,
    fixpoint_id,
    price
  } = req.body;

  if (!model_id || !Array.isArray(repair_ids) || repair_ids.length === 0) {
    return res.status(400).json({ error: 'Dati preventivo mancanti' });
  }

  let finalPrice = price;

  // ======================
  // CALCOLO PERCENTUALI
  // ======================
  db.get(
    'SELECT price_percent FROM fixpoints WHERE id = ?',
    [fixpoint_id],
    (errBase, fp) => {

      const basePercent = fp?.price_percent || 0;

      db.get(
        'SELECT brand_id FROM models WHERE id = ?',
        [model_id],
        (errBrand, model) => {

          if (!model) {
            return saveQuote(finalPrice);
          }

          db.get(
            `
            SELECT price_percent
            FROM fixpoint_brand_rules
            WHERE fixpoint_id = ?
              AND brand_id = ?
            `,
            [fixpoint_id, model.brand_id],
            (errRule, rule) => {

              const brandPercent = rule?.price_percent || 0;
              const totalPercent = basePercent + brandPercent;

              finalPrice = Math.round(
                finalPrice + (finalPrice * totalPercent / 100)
              );

              saveQuote(finalPrice);
            }
          );
        }
      );
    }
  );

  // ======================
  // SALVA PREVENTIVO
  // ======================
  function saveQuote(calculatedPrice) {

    db.run(
      `
      INSERT INTO quotes
      (model_id, fixpoint_id, price,
       city, customer_name, customer_email, customer_phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ASSIGNED')
      `,
      [
        model_id,
        fixpoint_id,
        calculatedPrice,
        city,
        customer_name,
        customer_email,
        customer_phone
      ],
      function (err) {

        if (err) {
          console.error('Errore INSERT quotes', err);
          return res.status(500).json({ error: err.message });
        }

        const quoteId = this.lastID;

        const stmt = db.prepare(
          'INSERT INTO quote_repairs (quote_id, repair_id) VALUES (?, ?)'
        );

        repair_ids.forEach(rid => stmt.run(quoteId, rid));

        stmt.finalize();

        res.json({ success: true, quote_id: quoteId });
      }
    );
  }

});


/* =======================
   QUOTES – READ & UPDATE (SAFE ADD)
======================= */

// LIST ALL QUOTES (ADMIN)
app.get('/api/quotes', (req, res) => {
  db.all(
    `
    SELECT
      q.id,
      q.price,
      q.city,
      q.description,
      q.status,
      q.fixpoint_id,
      q.created_at,
      q.customer_name,
      q.customer_email,
      q.customer_phone,
      m.name AS model,
      GROUP_CONCAT(r.name, ', ') AS repair
    FROM quotes q
    LEFT JOIN models m ON m.id = q.model_id
    LEFT JOIN quote_repairs qr ON qr.quote_id = q.id
    LEFT JOIN repairs r ON r.id = qr.repair_id
    GROUP BY q.id
    ORDER BY q.created_at DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

// GET SINGLE QUOTE
app.get('/api/quotes/:id', (req, res) => {
  db.get(
    `
    SELECT
      q.*,
      m.name AS model,
      GROUP_CONCAT(r.name, ', ') AS repair
    FROM quotes q
    LEFT JOIN models m ON m.id = q.model_id
    LEFT JOIN quote_repairs qr ON qr.quote_id = q.id
    LEFT JOIN repairs r ON r.id = qr.repair_id
    WHERE q.id = ?
    GROUP BY q.id
    `,
    [req.params.id],
    (err, row) => {
      if (err || !row) return res.status(404).json({});
      res.json(row);
    }
  );
});

// ASSIGN FIXPOINT (ADMIN)
app.put('/api/quotes/:id/assign', (req, res) => {
  const { fixpoint_id } = req.body;

  db.run(
    'UPDATE quotes SET fixpoint_id=?, status="ASSIGNED" WHERE id=?',
    [fixpoint_id, req.params.id],
    function () {
      if (!this.changes) return res.status(404).json({});
      res.json({ success: true });
    }
  );
});

// DELETE QUOTE (ADMIN)
app.delete('/api/quotes/:id', (req, res) => {

  const quoteId = req.params.id;

  db.serialize(() => {

    // prima cancella riparazioni collegate
    db.run(
      'DELETE FROM quote_repairs WHERE quote_id = ?',
      [quoteId]
    );

    // poi cancella preventivo
    db.run(
      'DELETE FROM quotes WHERE id = ?',
      [quoteId],
      function(err) {

        if (err) {
          console.error('Errore DELETE quote', err);
          return res.status(500).json({ error:'Errore database' });
        }

        if (!this.changes) {
          return res.status(404).json({ error:'Preventivo non trovato' });
        }

        res.json({ success:true });

      }
    );

  });

});



/* =======================
   CHANGE STATUS (FIXPOINT / ADMIN)
   VERSIONE DEFINITIVA (SICURA + COERENTE)
======================= */
app.put('/api/quotes/:id/status', auth, (req, res) => {
console.log('CAMBIO STATO RICEVUTO', req.params.id, req.body);

  const { status } = req.body;
  const quoteId = req.params.id;
  const user = req.user;

  const allowed = ['ASSIGNED', 'NEW', 'IN_PROGRESS', 'DONE'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Stato non valido' });
  }

  db.get(
    'SELECT status, fixpoint_id FROM quotes WHERE id = ?',
    [quoteId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Preventivo non trovato' });
      }

      const current = row.status;

      // 🔒 FixPoint può agire SOLO sui suoi preventivi
      if (
        user.role === 'fixpoint' &&
        row.fixpoint_id !== user.fixpoint_id
      ) {
        return res
          .status(403)
          .json({ error: 'Preventivo non assegnato a te' });
      }

     // 🔒 se già chiuso → solo admin può riaprire
if (current === 'DONE' && user.role !== 'admin') {
  return res
    .status(403)
    .json({ error: 'Preventivo già chiuso' });
}


      // ✅ no-op: stesso stato
      if (current === status) {
        return res.json({ success: true });
      }

     // ======================
// LOGICA DEFINITIVA STATI
// ======================

let allowedTransition = false;

// 🔧 FLOW FIXPOINT
if (user.role === 'fixpoint') {
  allowedTransition =
    (current === 'ASSIGNED' && status === 'IN_PROGRESS') ||
    (current === 'IN_PROGRESS' && status === 'DONE');
}

// 👑 FLOW ADMIN
if (user.role === 'admin') {
  allowedTransition =
    (current === 'ASSIGNED' && status === 'IN_PROGRESS') ||
    (current === 'IN_PROGRESS' && status === 'DONE') ||
    (current === 'DONE' && status === 'ASSIGNED');
}



      if (!allowedTransition) {
        return res
          .status(403)
          .json({ error: 'Transizione non consentita' });
      }

      // ✅ UPDATE GLOBALE (admin + fixpoint sempre sincronizzati)
      db.run(
        'UPDATE quotes SET status = ? WHERE id = ?',
        [status, quoteId],
        function () {
          if (!this.changes) {
            return res.status(404).json({ error: 'Aggiornamento fallito' });
          }

          res.json({ success: true });
        }
      );
    }
  );
});

// ADMIN – RIAPERTURA PREVENTIVO
app.put('/api/admin/quotes/:id/reopen', (req, res) => {
  const quoteId = req.params.id;

  db.get(
    'SELECT status FROM quotes WHERE id = ?',
    [quoteId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Preventivo non trovato' });
      }

      if (row.status !== 'DONE') {
        return res
          .status(400)
          .json({ error: 'Preventivo non chiuso' });
      }

      db.run(
        'UPDATE quotes SET status = "ASSIGNED" WHERE id = ?',
        [quoteId],
        function () {
          res.json({ success: true });
        }
      );
    }
  );
});



// FIXPOINT – ONLY OWN QUOTES
app.get('/api/fixpoint/quotes', (req, res) => {
  const { fixpoint_id } = req.query;
  if (!fixpoint_id) return res.json([]);

  db.all(
    `
    SELECT
      q.id,
      q.status,
      q.city,
      q.price,
      q.created_at,
      q.customer_name,
      q.customer_email,
      q.customer_phone,
      q.description,
      m.name AS model,
      GROUP_CONCAT(r.name, ', ') AS repair
    FROM quotes q
    LEFT JOIN models m ON m.id = q.model_id
    LEFT JOIN quote_repairs qr ON qr.quote_id = q.id
    LEFT JOIN repairs r ON r.id = qr.repair_id
    WHERE q.fixpoint_id = ?
    GROUP BY q.id
    ORDER BY q.created_at DESC
    `,
    [fixpoint_id],
    (err, rows) => {
      if (err) {
        console.error('Errore GET /api/fixpoint/quotes', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

/* =======================
   STATISTICHE (READ ONLY)
======================= */
app.get('/api/stats/overview', (req, res) => {
  db.get(
    `
    SELECT
     /* ===== QUOTES ===== */
(SELECT COUNT(*) FROM quotes) AS total,

(SELECT COUNT(*) FROM quotes WHERE status='ASSIGNED') AS assigned_count,

(SELECT COUNT(*) FROM quotes WHERE status='IN_PROGRESS') AS working_count,

(SELECT COUNT(*) FROM quotes WHERE status='DONE') AS done_count,

/* 💰 TOTALE SOLO PREVENTIVI CHIUSI */
(SELECT IFNULL(SUM(price),0) FROM quotes WHERE status='DONE') AS total_amount,

      /* ===== VALUTAZIONI ===== */
      (SELECT COUNT(*) FROM device_valuations) AS valuations_total,
      (SELECT COUNT(*) FROM device_valuations WHERE status='NEW') AS valuations_new,
      (SELECT COUNT(*) FROM device_valuations WHERE status='IN_CONTACT') AS valuations_contact,
      (SELECT COUNT(*) FROM device_valuations WHERE status='CLOSED') AS valuations_closed
    `,
    [],
    (err, row) => {
      if (err) {
        console.error('Errore statistiche:', err);
        return res.status(500).json({});
      }
      res.json(row);
    }
  );
});

/* =======================
   STATISTICHE PDF (READ ONLY)
======================= */


app.get('/api/stats/overview/pdf', (req, res) => {
  db.get(
    `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) AS new_count,
      SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned_count,
      SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) AS done_count,
      IFNULL(SUM(price), 0) AS total_amount
    FROM quotes
    `,
    [],
    (err, stats) => {
      if (err) {
        console.error('Errore PDF stats', err);
        return res.status(500).end();
      }

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=statistiche_fixpoint.pdf'
      );

      doc.pipe(res);

      doc.fontSize(20).text('Report Statistiche FixPoint', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12);
      doc.text(`Totale preventivi: ${stats.total}`);
      doc.text(`Nuovi: ${stats.new_count}`);
      doc.text(`Assegnati: ${stats.assigned_count}`);
      doc.text(`Completati: ${stats.done_count}`);
      doc.moveDown();
      doc.fontSize(14).text(`Incasso totale: € ${stats.total_amount}`);

      doc.moveDown(2);
      doc.fontSize(10).text(
        `Generato il: ${new Date().toLocaleString('it-IT')}`
      );

      doc.end();
    }
  );
});

/* =======================
   PDF PREVENTIVO (ADMIN)
======================= */
app.get('/api/quotes/:id/pdf', (req, res) => {
  const quoteId = req.params.id;

  db.get(
    `
    SELECT
      q.id,
      q.price,
      q.city,
      q.status,
      q.created_at,
      q.customer_name,
      q.customer_email,
      m.name AS model,
      GROUP_CONCAT(r.name, ', ') AS repair,
      f.name AS fixpoint_name,
      f.city AS fixpoint_city,
      f.address AS fixpoint_address,
      f.phone AS fixpoint_phone
    FROM quotes q
    LEFT JOIN models m ON m.id = q.model_id
    LEFT JOIN quote_repairs qr ON qr.quote_id = q.id
    LEFT JOIN repairs r ON r.id = qr.repair_id
    LEFT JOIN fixpoints f ON f.id = q.fixpoint_id
    WHERE q.id = ?
    GROUP BY q.id
    `,
    [quoteId],
    (err, q) => {
      if (err || !q) {
        return res.status(404).json({ error: 'Preventivo non trovato' });
      }

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=preventivo_${q.id}.pdf`
      );

      doc.pipe(res);

      // ===== HEADER
      doc
        .fontSize(18)
        .text(q.fixpoint_name || 'FixPoint', { align: 'left' })
        .fontSize(10)
        .text(q.fixpoint_city || '')
        .text(q.fixpoint_address || '')
        .text(q.fixpoint_phone || '')
        .moveDown();

      // ===== TITLE
      doc
        .fontSize(16)
        .text(`Preventivo #${q.id}`, { align: 'center' })
        .moveDown(2);

   // ===== CLIENTE
doc.fontSize(12).text('Dati Cliente', { underline: true });
doc
  .fontSize(10)
  .text(`Nome: ${q.customer_name}`)
  .text(`Email: ${q.customer_email}`)
  .text(`Telefono: ${q.customer_phone || ''}`) 
  .text(`Città: ${q.city}`)
  .moveDown();


      // ===== DISPOSITIVO
      doc.fontSize(12).text('Dispositivo', { underline: true });
      doc
        .fontSize(10)
        .text(`Modello: ${q.model}`)
        .text(`Riparazioni: ${q.repair}`)
        .moveDown();

      // ===== PREZZO
      doc.fontSize(12).text('Totale', { underline: true });
      doc
        .fontSize(14)
        .text(`€ ${q.price}`, { bold: true })
        .moveDown(2);

      // ===== FOOTER
      doc
        .fontSize(9)
        .text(`Creato il: ${q.created_at}`)
        .moveDown(3)
        .text('Firma cliente: ____________________________');

      doc.end();
    }
  );
});

/* =======================
   AUTH – LOGIN
======================= */
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password obbligatorie' });
  }

  db.get(
    `
    SELECT
      id,
      email,
      password_hash,
      role,
      fixpoint_id
    FROM users
    WHERE LOWER(email) = LOWER(?)
    `,
    [email],
    async (err, user) => {
      if (err) {
        console.error('Errore login:', err);
        return res.status(500).json({ error: 'Errore server' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          fixpoint_id: user.fixpoint_id
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fixpoint_id: user.fixpoint_id
        }
      });
    }
  );
});


function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

app.post('/api/admin/fixpoints', async (req, res) => {

  const { name, city, address, phone, email, vat_number, price_percent } = req.body;

  if (!name || !city || !email) {
    return res.status(400).json({ error: 'Nome, città ed email obbligatori' });
  }

  const plainPassword = generatePassword();
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // 🔥 NORMALIZZA CITTA (Reggio nell'Emilia → Reggio Emilia)
  const normalizeCity = (str) => {
    return str
      .toLowerCase()
      .replace(/nell'/g,' ')
      .replace(/di /g,' ')
      .replace(/\s+/g,' ')
      .trim();
  };

  let lat = null;
  let lng = null;

  try {

    // 🔥 GEO CODING AUTOMATICO
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&q=${encodeURIComponent(normalizeCity(city))}`
    );

    const geoData = await geoRes.json();

    if (geoData && geoData.length) {
      lat = geoData[0].lat;
      lng = geoData[0].lon;
    }

  } catch(e) {
    console.log('Geo fallito ma continuo senza bloccare:', e.message);
  }

  db.run(
    `
    INSERT INTO fixpoints
    (name, city, address, phone, email, vat_number, price_percent, lat, lng, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `,
    [
      name,
      city,
      address || null,
      phone || null,
      email || null,
      vat_number || null,
      price_percent || 0,
      lat,
      lng
    ],
    function (err) {

      if (err) {
        console.error('Errore INSERT fixpoint:', err);
        return res.status(500).json({ error: err.message });
      }

      const fixpointId = this.lastID;

      db.run(
        `
        INSERT INTO users (email, password_hash, role, fixpoint_id, active)
        VALUES (?, ?, 'fixpoint', ?, 1)
        `,
        [email, passwordHash, fixpointId],
        function (err2) {

          if (err2) {
            console.error('Errore INSERT user fixpoint:', err2);
            return res.status(500).json({ error: err2.message });
          }

          res.json({
            success: true,
            fixpoint: {
              id: fixpointId,
              name,
              city,
              address,
              phone,
              email,
              lat,
              lng
            },
            credentials: {
              username: email,
              password: plainPassword
            }
          });

        }
      );

    }
  );

});

/* =======================
   ADMIN – RESET PASSWORD FIXPOINT
======================= */
app.post('/api/admin/users/:id/reset-password', async (req, res) => {
  const userId = req.params.id;

  try {
    const newPassword = generatePassword();
    const newHash = await bcrypt.hash(newPassword, 10);

    db.run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newHash, userId],
      function (err) {
        if (err) {
          console.error('Errore reset password:', err);
          return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Utente non trovato' });
        }

        res.json({
          success: true,
          password: newPassword // ⚠️ MOSTRATA UNA SOLA VOLTA
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore server' });
  }
});




/* =======================
   ADMIN – UPDATE VALUATION STATUS
======================= */
app.put('/api/admin/valuations/:id/status', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const { status } = req.body;
  const allowed = ['NEW', 'SEEN', 'IN_CONTACT', 'CLOSED'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Stato non valido' });
  }

  db.run(
    'UPDATE device_valuations SET status = ? WHERE id = ?',
    [status, req.params.id],
    function (err) {
      if (err) {
        console.error('Errore update valuation status', err);
        return res.status(500).json({ error: 'Errore database' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Valutazione non trovata' });
      }

      res.json({ success: true });
    }
  );
});


/* =======================
   ADMIN – CREATE QUOTE FROM VALUATION
======================= */
app.post('/api/admin/valuations/:id/create-quote', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const valuationId = req.params.id;

  db.get(
    `
    SELECT
      dv.*,
      m.id AS model_id
    FROM device_valuations dv
    JOIN models m ON m.id = dv.model_id
    WHERE dv.id = ?
    `,
    [valuationId],
    (err, valuation) => {
      if (err || !valuation) {
        return res.status(404).json({ error: 'Valutazione non trovata' });
      }

      // crea preventivo con dati cliente + fixpoint già scelto
      db.run(
        `
        INSERT INTO quotes
        (
          model_id,
          fixpoint_id,
          price,
          city,
          customer_name,
          customer_email,
          customer_phone,
          status
        )
        VALUES (?, ?, 0, ?, ?, ?, ?, 'ASSIGNED')
        `,
        [
          valuation.model_id,
          valuation.fixpoint_id,
          valuation.city,
          valuation.customer_name,
          valuation.customer_email,
          valuation.customer_phone,
        ],
        function (err2) {
          if (err2) {
            console.error('Errore creazione quote', err2);
            return res.status(500).json({ error: 'Errore creazione preventivo' });
          }

          const quoteId = this.lastID;

          // chiude la valutazione
          db.run(
            'UPDATE device_valuations SET status = "CLOSED" WHERE id = ?',
            [valuationId]
          );

          res.json({
            success: true,
            quote_id: quoteId,
          });
        }
      );
    }
  );
});


app.post('/api/admin/defects', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.run(
    'INSERT INTO device_defects (name) VALUES (?)',
    [req.body.name],
    function (err) {
      if (err) return res.status(500).json({ error: 'Errore DB' });
      res.json({ success: true, id: this.lastID });
    }
  );
});



/* =======================
   ADMIN – DELETE FULL VALUATION CONFIG
======================= */
app.delete('/api/admin/models/:id/valuation-config', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.serialize(() => {
    db.run(
      'DELETE FROM device_defect_penalties WHERE model_id = ?',
      [req.params.id]
    );
    db.run(
      'DELETE FROM device_base_values WHERE model_id = ?',
      [req.params.id],
      err => {
        if (err) {
          console.error('Errore delete valuation config', err);
          return res.status(500).json({ error: 'Errore DB' });
        }
        res.json({ success: true });
      }
    );
  });
});







/* =======================
   ADMIN – VALUATION CONFIG LIST
======================= */
app.get('/api/admin/valuation-configs', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

 db.all(
  `
  SELECT
    dt.name AS device_type,
    b.id AS brand_id,
    b.name AS brand,
    m.id AS model_id,
    m.name AS model,
    bv.max_value
  FROM device_base_values bv
LEFT JOIN models m ON m.id = bv.model_id
LEFT JOIN brands b ON b.id = m.brand_id
LEFT JOIN device_types dt ON dt.id = m.device_type_id


  ORDER BY dt.name, b.name, m.name
  `,

    [],
    (err, rows) => {
      if (err) {
        console.error('Errore valuation-configs', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});


/* =======================
   ADMIN – GET BASE VALUE
======================= */
app.get('/api/admin/models/:id/base-value', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.get(
    'SELECT max_value FROM device_base_values WHERE model_id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({});
      }
      res.json(row || { max_value: 0 });
    }
  );
});

/* =======================
   ADMIN – SET BASE VALUE
======================= */
app.post('/api/admin/models/:id/base-value', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  const { max_value } = req.body;

  db.run(
    `
    INSERT INTO device_base_values (model_id, max_value)
    VALUES (?, ?)
    ON CONFLICT(model_id)
    DO UPDATE SET max_value = excluded.max_value
    `,
    [req.params.id, max_value],
    err => {
      if (err) return res.status(500).json({ error: 'Errore DB' });
      res.json({ success: true });
    }
  );
});


/* =======================
   ADMIN – GET DEFECT PENALTIES
======================= */
app.get('/api/admin/models/:id/defect-penalties', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.all(
    `
    SELECT
      dp.defect_id,
      d.name,
      dp.penalty
    FROM device_defect_penalties dp
    JOIN device_defects d ON d.id = dp.defect_id
    WHERE dp.model_id = ?
    ORDER BY d.name
    `,
    [req.params.id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});


/* =======================
   ADMIN – DELETE ALL PENALTIES
======================= */
app.delete('/api/admin/models/:id/defects', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.run(
    'DELETE FROM device_defect_penalties WHERE model_id = ?',
    [req.params.id],
    err => {
      if (err) return res.status(500).json({ error: 'Errore DB' });
      res.json({ success: true });
    }
  );
});


/* =======================
   CALCULATE DEVICE VALUE
======================= */
app.post('/api/valuation/calculate', (req, res) => {
  const { model_id, defect_ids } = req.body;

  if (!model_id || !Array.isArray(defect_ids)) {
    return res.status(400).json({ error: 'Dati non validi' });
  }

  db.get(
    'SELECT max_value FROM device_base_values WHERE model_id = ?',
    [model_id],
    (err, base) => {
      if (err || !base) {
        return res.status(404).json({ error: 'Valore base non trovato' });
      }

      const placeholders = defect_ids.map(() => '?').join(',');

      if (!defect_ids.length) {
        return res.json({
          max_value: base.max_value,
          total_penalty: 0,
          final_value: base.max_value,
        });
      }

      db.all(
        `
        SELECT SUM(penalty) AS total_penalty
        FROM device_defect_penalties
        WHERE model_id = ?
          AND defect_id IN (${placeholders})
        `,
        [model_id, ...defect_ids],
        (err2, rows) => {
          if (err2) return res.status(500).json({ error: 'Errore DB' });

          const total = rows[0]?.total_penalty || 0;
          res.json({
            max_value: base.max_value,
            total_penalty: total,
            final_value: Math.max(0, base.max_value - total),
          });
        }
      );
    }
  );
});

/* =======================
   ADMIN – GET DEFECTS
======================= */
app.get('/api/admin/defects', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso negato' });
  }

  db.all(
    'SELECT id, name FROM device_defects ORDER BY name',
    [],
    (err, rows) => {
      if (err) {
        console.error('Errore GET defects', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});


// DIFETTI SOLO PER MODELLO (VERSIONE CORRETTA FIXPOINT)
app.get('/api/valuation/defects/:model_id', (req, res) => {
  const { model_id } = req.params;

  db.all(
    `
    SELECT DISTINCT d.id, d.name
    FROM device_defect_penalties dp
    JOIN device_defects d ON d.id = dp.defect_id
    WHERE dp.model_id = ?
    ORDER BY d.name
    `,
    [model_id],
    (err, rows) => {
      if (err) {
        console.error('ERROR defects by model:', err);
        return res.status(500).json([]);
      }

      res.json(rows || []);
    }
  );
});



/* =======================
   DEFECTS – PUBBLICO
======================= */
app.get('/api/defects', (req, res) => {
  db.all(
    'SELECT id, name FROM device_defects ORDER BY name',
    [],
    (err, rows) => {
      if (err) {
        console.error('Errore GET public defects', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});


/* ==============================
   CALCOLO PREZZO FINALE FIXPOINT
============================== */
app.get('/api/calc-price', (req, res) => {

  const { model_id, repair_ids, fixpoint_id } = req.query;

  if (!model_id || !repair_ids || !fixpoint_id) {
    return res.status(400).json({ error: 'Parametri mancanti' });
  }

  const repairsArray = repair_ids.split(',').map(Number);

  // 1️⃣ PREZZO BASE RIPARAZIONI
  const placeholders = repairsArray.map(() => '?').join(',');

  db.all(
    `SELECT price FROM model_repairs
     WHERE model_id=? AND repair_id IN (${placeholders})`,
    [model_id, ...repairsArray],
    (err, repairs) => {

      if (err) return res.status(500).json(err);

      const baseTotal = repairs.reduce((acc, r) => acc + r.price, 0);

      // 2️⃣ RECUPERO BRAND DEL MODELLO
      db.get(
        `SELECT brand_id FROM models WHERE id=?`,
        [model_id],
        (err2, model) => {

          if (err2 || !model) {
            return res.json({
              base: baseTotal,
              percent: 0,
              final: baseTotal
            });
          }

          const brandId = model.brand_id;

          // 3️⃣ BASE PERCENT FIXPOINT
          db.get(
            `SELECT price_percent FROM fixpoints WHERE id=?`,
            [fixpoint_id],
            (err3, fp) => {

              const basePercent = fp?.price_percent || 0;

              // 4️⃣ BRAND RULE
              db.get(
                `SELECT price_percent
                 FROM fixpoint_brand_rules
                 WHERE fixpoint_id=? AND brand_id=?`,
                [fixpoint_id, brandId],
                (err4, brandRule) => {

                  const brandPercent = brandRule?.price_percent || 0;

                  const totalPercent = basePercent + brandPercent;

                  const finalPrice = Math.round(
                    baseTotal * (1 + totalPercent / 100)
                  );

                  res.json({
                    base: baseTotal,
                    percent: totalPercent,
                    final: finalPrice
                  });

                }
              );

            }
          );

        }
      );

    }
  );

});


/* =======================
   PUBLIC – VALUATION DEVICES (CONFIGURATI)
======================= */
app.get('/api/valuation/devices', (req, res) => {

  db.all(
    `
    SELECT
      dt.id AS device_type_id,
      dt.name AS device_type,
      b.id AS brand_id,
      b.name AS brand,
      m.id AS model_id,
      m.name AS model
    FROM device_base_values bv
    JOIN models m ON m.id = bv.model_id
    JOIN brands b ON b.id = m.brand_id
    JOIN device_types dt ON dt.id = m.device_type_id
    ORDER BY dt.name, b.name, m.name
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error('Errore valuation devices', err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});





/* =========================================
   DEVICE TYPE USED CHECK (ADMIN CLEAN)
========================================= */
app.get('/api/device-types/:id/used', (req, res) => {
  const id = req.params.id;

  db.get(
    `SELECT COUNT(*) as count FROM models WHERE device_type_id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error('Errore used device-type:', err);
        return res.status(500).json({ used: false });
      }

      res.json({ used: row.count > 0 });
    }
  );
});

/* ================================
   QUICK VALUATION LIVE ENGINE
================================ */
/*
app.post('/api/fixpoint/quick-valuation', (req, res) => {
  const {
    model,
    city,
    customer_name,
    customer_email,
    customer_phone,
    max_value,
    total_penalty,
    defects,
  } = req.body;

  if (!model) {
    return res.status(400).json({ error: 'Dati mancanti' });
  }

  db.run(
    `
    INSERT INTO device_valuations

    (model, city, customer_name, customer_email, customer_phone,
     max_value, total_penalty, defects, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW')
    `,
    [
  model || '',
  city || '',
  customer_name || '',
  customer_email || '',
  customer_phone || '',
  max_value || 0,
  total_penalty || 0,
  defects || ''
],

    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Errore DB' });
      }

      res.json({
        success: true,
        valuation_id: this.lastID,
      });
    }
  );
});
*/

/* =======================
   CONTACT FORM MAIL
======================= */
app.post('/api/contact', async (req,res)=>{

  const { name, email, phone, message } = req.body;

  if(!name || !email || !message){
    return res.status(400).json({error:'Dati mancanti'});
  }

  try{

   await transporter.sendMail({

  from: `"FixPoint Contatti" <info@fixpointitalia.com>`,
  to: "info@fixpointitalia.com",
  cc: email,
  replyTo: email,

  subject: `📩 Nuovo messaggio contatti FixPoint`,

  html: `
  <div style="font-family:Arial;padding:20px;">
    <h2>Nuovo messaggio dal sito FixPoint</h2>

    <p><b>Nome:</b> ${name}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Telefono:</b> ${phone || '-'}</p>

    <hr/>

    <p>${message.replace(/\n/g,'<br/>')}</p>

    <hr/>
    <small>Inviato dal form contatti FixPoint</small>
  </div>
  `
});

    res.json({success:true});

  }catch(err){
    console.log('Errore invio mail:',err);
    res.status(500).json({error:'Errore invio mail'});
  }

});


/* =======================
   START
======================= */
app.listen(PORT, () => {
  console.log(`Backend avviato su http://localhost:${PORT} ✅`);
});
