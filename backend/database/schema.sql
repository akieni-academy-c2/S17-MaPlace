CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE queue_status AS ENUM (
    'OPEN',
    'PAUSED',
    'CLOSED'
);

-- Secteurs d'activité proposés aux clients (filtres, visuels des fiches).
CREATE TYPE establishment_category AS ENUM (
    'ADMINISTRATION',
    'SANTE',
    'BANQUE',
    'TELECOM',
    'BEAUTE'
);

CREATE TYPE ticket_status AS ENUM (
    'WAITING',
    'SERVING',
    'COMPLETED',
    'CANCELLED'
);


CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    phone VARCHAR(30),

    category establishment_category NOT NULL,

    description TEXT,

    -- Localisation : adresse (rue, repère), quartier ou arrondissement, ville.
    address VARCHAR(255) NOT NULL,

    district VARCHAR(100) NOT NULL,

    city VARCHAR(100) NOT NULL DEFAULT 'Brazzaville',

    -- Horaires affichés tels quels (ex. « Lun – Ven · 7h30 – 15h30 »).
    opening_hours VARCHAR(150),

    -- Miroir du statut de la file, synchronisé lors des transitions.
    queue_status queue_status NOT NULL DEFAULT 'CLOSED',

    -- Durée moyenne d'un passage au guichet (en minutes), renseignée par
    -- l'établissement : sert au calcul du temps d'attente estimé.
    average_service_minutes SMALLINT NOT NULL DEFAULT 5,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT establishments_average_service_minutes_range
        CHECK (average_service_minutes BETWEEN 1 AND 240)
);


CREATE TABLE queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    establishment_id UUID NOT NULL,

    status queue_status NOT NULL DEFAULT 'OPEN',

    -- Dernier numéro attribué sur cette file.
    last_number INTEGER NOT NULL DEFAULT 0,

    -- Motif d'une pause : NULL (pause ponctuelle) ou 'NEXT_DAY' (file reportée
    -- au lendemain, les tickets en attente conservent leur numéro).
    pause_reason VARCHAR(20),

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

    CONSTRAINT queues_pause_reason_valid
        CHECK (
            pause_reason IS NULL
            OR (status = 'PAUSED' AND pause_reason = 'NEXT_DAY')
        ),

    -- La date de fermeture doit correspondre au statut CLOSED.
    CONSTRAINT queues_closed_at_consistent
        CHECK (
            (status = 'CLOSED' AND closed_at IS NOT NULL)
            OR
            (status <> 'CLOSED' AND closed_at IS NULL)
        )
);


CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID NOT NULL,
    number INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    cancel_token VARCHAR(255) NOT NULL,
    status ticket_status NOT NULL DEFAULT 'WAITING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tickets_queue
        FOREIGN KEY (queue_id)
        REFERENCES queues(id)
        ON DELETE CASCADE,

    CONSTRAINT tickets_number_positive
        CHECK (number > 0),

    CONSTRAINT tickets_unique_number_per_queue
        UNIQUE (queue_id, number)
);


CREATE INDEX idx_establishments_category
    ON establishments(category);

CREATE INDEX idx_queues_establishment_id
    ON queues(establishment_id);

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