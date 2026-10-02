-- =========================================================
-- MA PLACE
-- Schéma de base de données
-- PostgreSQL
-- =========================================================


-- =========================================================
-- 1. EXTENSION UUID
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========================================================
-- 2. TYPES ENUM
-- =========================================================

CREATE TYPE establishment_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);

CREATE TYPE queue_status AS ENUM (
    'OPEN',
    'PAUSED',
    'REGISTRATION_CLOSED',
    'CLOSED'
);

CREATE TYPE ticket_status AS ENUM (
    'WAITING',
    'CALLED',
    'IN_SERVICE',
    'COMPLETED',
    'ABSENT',
    'CANCELLED'
);

CREATE TYPE ticket_channel AS ENUM (
    'ONLINE',
    'PHYSICAL'
);


-- =========================================================
-- 3. TABLE USER
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(30),

    password_hash TEXT NOT NULL,

    is_admin BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 4. TABLE CATEGORY
-- =========================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    designation VARCHAR(100) NOT NULL UNIQUE,

    status BOOLEAN NOT NULL DEFAULT TRUE
);


-- =========================================================
-- 5. TABLE ESTABLISHMENT
-- =========================================================

CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID NOT NULL,

    manager_id UUID NOT NULL,

    name VARCHAR(150) NOT NULL,

    address TEXT NOT NULL,

    description TEXT,

    status establishment_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_establishment_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_establishment_manager
        FOREIGN KEY (manager_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
);


-- =========================================================
-- 6. TABLE SERVICE
-- =========================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    establishment_id UUID NOT NULL,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    status BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_establishment
        FOREIGN KEY (establishment_id)
        REFERENCES establishments(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_service_name_per_establishment
        UNIQUE (establishment_id, name)
);


-- =========================================================
-- 7. TABLE QUEUE
-- =========================================================

CREATE TABLE queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    establishment_id UUID NOT NULL,

    date DATE NOT NULL DEFAULT CURRENT_DATE,

    status queue_status NOT NULL DEFAULT 'OPEN',

    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    closed_at TIMESTAMPTZ,

    CONSTRAINT fk_queue_establishment
        FOREIGN KEY (establishment_id)
        REFERENCES establishments(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_queue_per_day
        UNIQUE (establishment_id, date)
);


-- =========================================================
-- 8. TABLE TICKET
-- =========================================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    queue_id UUID NOT NULL,

    user_id UUID,

    name VARCHAR(100) NOT NULL,

    phone VARCHAR(30) NOT NULL,

    number INTEGER NOT NULL,

    status ticket_status NOT NULL DEFAULT 'WAITING',

    channel ticket_channel NOT NULL DEFAULT 'ONLINE',

    tracking_token TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    called_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    CONSTRAINT fk_ticket_queue
        FOREIGN KEY (queue_id)
        REFERENCES queues(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ticket_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT unique_ticket_number_per_queue
        UNIQUE (queue_id, number),

    CONSTRAINT unique_tracking_token
        UNIQUE (tracking_token),

    CONSTRAINT ticket_number_positive
        CHECK (number > 0)
);


-- =========================================================
-- 9. TABLE TICKET_EVENT
-- =========================================================

CREATE TABLE ticket_events (
    id BIGSERIAL PRIMARY KEY,

    ticket_id UUID NOT NULL,

    old_status ticket_status,

    new_status ticket_status NOT NULL,

    actor_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_event_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES tickets(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ticket_event_actor
        FOREIGN KEY (actor_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================================================
-- 10. INDEX
-- =========================================================

CREATE INDEX idx_establishments_category_id
    ON establishments(category_id);

CREATE INDEX idx_establishments_manager_id
    ON establishments(manager_id);

CREATE INDEX idx_queues_establishment_id
    ON queues(establishment_id);

CREATE INDEX idx_queues_date
    ON queues(date);

CREATE INDEX idx_services_establishment_id
    ON services(establishment_id);

CREATE INDEX idx_tickets_queue_id
    ON tickets(queue_id);

CREATE INDEX idx_tickets_user_id
    ON tickets(user_id);

CREATE INDEX idx_tickets_status
    ON tickets(status);

CREATE INDEX idx_tickets_tracking_token
    ON tickets(tracking_token);

CREATE INDEX idx_ticket_events_ticket_id
    ON ticket_events(ticket_id);


-- =========================================================
-- FIN DU SCHEMA
-- =========================================================