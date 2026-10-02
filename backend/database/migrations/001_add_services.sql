-- =========================================================
-- MA PLACE
-- Migration 001 : table SERVICES
--
-- Un établissement possède plusieurs services.
-- Un service sera relié à une file d'attente à l'étape 5.
-- =========================================================

CREATE TABLE IF NOT EXISTS services (
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

CREATE INDEX IF NOT EXISTS idx_services_establishment_id
    ON services(establishment_id);
