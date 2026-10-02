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

    -- MIROIR du statut de la file du jour.
    -- La source de vérité est la table queues (colonne status).
    -- Ce champ est synchronisé par queueService lors de chaque
    -- transition et permet au GET /api/establishments (public)
    -- de savoir si la file est ouverte sans jointure.
    queue_status queue_status NOT NULL DEFAULT 'CLOSED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 4. TABLE : QUEUES
-- =========================================================
-- Une file = une journée.
-- Chaque ouverture de file crée une nouvelle ligne.
-- L'historique est conservé (les files CLOSED restent en base).

CREATE TABLE queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    establishment_id UUID NOT NULL,

    status queue_status NOT NULL DEFAULT 'OPEN',

    -- Dernier numéro attribué sur cette file.
    -- Permet de générer le prochain numéro sans collision
    -- lors de créations simultanées.
    last_number INTEGER NOT NULL DEFAULT 0,

    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    closed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_queues_establishment
        FOREIGN KEY (establishment_id)
        REFERENCES establishments(id)
        ON DELETE CASCADE,

    CONSTRAINT queues_last_number_positive
        CHECK (last_number >= 0),

    -- Une file ne peut être fermée sans date de fermeture,
    -- et ne peut pas être ouverte avec une date de fermeture.
    CONSTRAINT queues_closed_at_consistent
        CHECK (
            (status = 'CLOSED' AND closed_at IS NOT NULL)
            OR
            (status <> 'CLOSED' AND closed_at IS NULL)
        )
);


-- =========================================================
-- 5. TABLE : TICKETS
-- =========================================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Un ticket appartient à une file (donc à une journée).
    queue_id UUID NOT NULL,

    number INTEGER NOT NULL,

    name VARCHAR(100) NOT NULL,

    phone VARCHAR(30) NOT NULL,

    status ticket_status NOT NULL DEFAULT 'WAITING',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tickets_queue
        FOREIGN KEY (queue_id)
        REFERENCES queues(id)
        ON DELETE CASCADE,

    -- Un numéro ne peut être attribué qu'une seule fois par file.
    CONSTRAINT tickets_number_positive
        CHECK (number > 0),

    CONSTRAINT tickets_unique_number_per_queue
        UNIQUE (queue_id, number)
);


-- =========================================================
-- 6. INDEX
-- =========================================================

CREATE INDEX idx_queues_establishment_id
    ON queues(establishment_id);

-- Recherche de la file du jour (status OPEN ou PAUSED).
CREATE INDEX idx_queues_establishment_status
    ON queues(establishment_id, status);

CREATE INDEX idx_queues_establishment_opened_at
    ON queues(establishment_id, opened_at DESC);

CREATE INDEX idx_tickets_queue_id
    ON tickets(queue_id);

CREATE INDEX idx_tickets_queue_status
    ON tickets(queue_id, status);

CREATE INDEX idx_tickets_queue_number
    ON tickets(queue_id, number);


-- =========================================================
-- 7. TRIGGER : updated_at
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


CREATE TRIGGER queues_updated_at
BEFORE UPDATE ON queues
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();