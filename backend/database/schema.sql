CREATE EXTENSION IF NOT EXISTS pgcrypto;

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


CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    phone VARCHAR(30),

    -- Miroir du statut de la file, synchronisé lors des transitions.
    queue_status queue_status NOT NULL DEFAULT 'CLOSED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    establishment_id UUID NOT NULL,

    status queue_status NOT NULL DEFAULT 'OPEN',

    -- Dernier numéro attribué sur cette file.
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