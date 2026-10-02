-- =========================================================
-- MA PLACE
-- Schéma PostgreSQL - MVP
-- =========================================================


-- =========================================================
-- 1. EXTENSION UUID
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========================================================
-- 2. ENUMS
-- =========================================================

CREATE TYPE queue_status AS ENUM (
    'OPEN',
    'PAUSED',
    'CLOSED'
);

CREATE TYPE ticket_status AS ENUM (
    'WAITING',
    'SERVING',
    'COMPLETED',
    'CANCELLED'
);


-- =========================================================
-- 3. TABLE : ESTABLISHMENTS
-- =========================================================

CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    phone VARCHAR(30),

    queue_status queue_status NOT NULL DEFAULT 'CLOSED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 4. TABLE : TICKETS
-- =========================================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    establishment_id UUID NOT NULL,

    number INTEGER NOT NULL,

    customer_name VARCHAR(100) NOT NULL,

    customer_phone VARCHAR(30) NOT NULL,

    status ticket_status NOT NULL DEFAULT 'WAITING',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tickets_establishment
        FOREIGN KEY (establishment_id)
        REFERENCES establishments(id)
        ON DELETE CASCADE,

    CONSTRAINT tickets_number_positive
        CHECK (number > 0)
);


-- =========================================================
-- 5. INDEX
-- =========================================================

CREATE INDEX idx_tickets_establishment_id
    ON tickets(establishment_id);

CREATE INDEX idx_tickets_establishment_created_at
    ON tickets(establishment_id, created_at);

CREATE INDEX idx_tickets_establishment_status
    ON tickets(establishment_id, status);


-- =========================================================
-- 6. TRIGGER : updated_at
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER establishments_updated_at
BEFORE UPDATE ON establishments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();