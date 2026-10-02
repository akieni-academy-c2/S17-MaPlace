-- =========================================================
-- MA PLACE
-- Migration 002 : la file d'attente dépend du SERVICE
--
-- Règle d'or : une file = un service + une journée.
-- Avant : UNIQUE (establishment_id, date)
-- Après : UNIQUE (service_id, date)
-- =========================================================

-- 1. On retire l'ancienne contrainte « une file par établissement et par jour ».
ALTER TABLE queues
    DROP CONSTRAINT unique_queue_per_day;

-- 2. Nouvelle colonne : le service propriétaire de la file.
ALTER TABLE queues
    ADD COLUMN service_id UUID
    REFERENCES services(id) ON DELETE RESTRICT;

-- 3. Sécurisation des lignes éventuelles déjà présentes (table vide aujourd'hui :
--    cette requête ne change rien, elle évite juste l'échec de l'étape 4).
UPDATE queues
   SET service_id = (
        SELECT s.id
          FROM services s
          JOIN establishments e ON e.id = s.establishment_id
         LIMIT 1
   )
 WHERE service_id IS NULL;

-- 4. La colonne devient obligatoire.
ALTER TABLE queues
    ALTER COLUMN service_id SET NOT NULL;

-- 5. Une file par service et par jour.
ALTER TABLE queues
    ADD CONSTRAINT unique_queue_per_service_per_day
    UNIQUE (service_id, date);

-- 6. Index pour les recherches « file du jour pour ce service ».
CREATE INDEX IF NOT EXISTS idx_queues_service_id
    ON queues(service_id);
