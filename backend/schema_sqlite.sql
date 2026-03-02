-- =========================
-- DEVICE TYPES
-- =========================
CREATE TABLE device_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================
-- BRANDS
-- =========================
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================
-- MODELS
-- =========================
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    device_type_id INTEGER NOT NULL REFERENCES device_types(id) ON DELETE CASCADE,
    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (name, device_type_id, brand_id)
);

-- =========================
-- REPAIRS
-- =========================
CREATE TABLE repairs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price NUMERIC(10,2) DEFAULT 0,
    device_type_id INTEGER,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================
-- MODEL REPAIRS
-- =========================
CREATE TABLE model_repairs (
    id SERIAL PRIMARY KEY,
    model_id INTEGER NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    price NUMERIC(10,2) NOT NULL,
    UNIQUE (model_id, repair_id)
);

-- =========================
-- FIXPOINTS
-- =========================
CREATE TABLE fixpoints (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    vat_number TEXT,
    price_percent INTEGER DEFAULT 0,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','fixpoint')),
    fixpoint_id INTEGER REFERENCES fixpoints(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================
-- QUOTES
-- =========================
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES models(id),
    fixpoint_id INTEGER REFERENCES fixpoints(id),
    price NUMERIC(10,2),
    city TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    description TEXT,
    preferred_datetime TIMESTAMP,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quote_repairs (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    repair_id INTEGER NOT NULL REFERENCES repairs(id)
);

CREATE TABLE quote_notes (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
    author_role TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quote_status_log (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- VALUATIONS
-- =========================
CREATE TABLE device_valuations (
    id SERIAL PRIMARY KEY,
    model_id INTEGER NOT NULL REFERENCES models(id),
    city TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    estimated_value NUMERIC(10,2),
    final_value NUMERIC(10,2),
    fixpoint_id INTEGER REFERENCES fixpoints(id),
    preferred_datetime TIMESTAMP,
    status TEXT DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE device_defects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE device_defect_penalties (
    id SERIAL PRIMARY KEY,
    model_id INTEGER NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    defect_id INTEGER NOT NULL REFERENCES device_defects(id) ON DELETE CASCADE,
    penalty NUMERIC(10,2) NOT NULL
);

CREATE TABLE device_base_values (
    model_id INTEGER PRIMARY KEY REFERENCES models(id) ON DELETE CASCADE,
    max_value NUMERIC(10,2) NOT NULL
);

CREATE TABLE valuation_defects (
    id SERIAL PRIMARY KEY,
    valuation_id INTEGER NOT NULL REFERENCES device_valuations(id) ON DELETE CASCADE,
    defect_id INTEGER NOT NULL REFERENCES device_defects(id)
);

-- =========================
-- FIXPOINT BRAND RULES
-- =========================
CREATE TABLE fixpoint_brand_rules (
    id SERIAL PRIMARY KEY,
    fixpoint_id INTEGER NOT NULL REFERENCES fixpoints(id) ON DELETE CASCADE,
    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    price_percent INTEGER DEFAULT 0
);