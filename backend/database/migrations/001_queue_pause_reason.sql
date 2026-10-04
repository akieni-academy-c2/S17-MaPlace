-- Report d'une file au lendemain (pause avec motif NEXT_DAY).
-- À appliquer sur une base créée avant l'ajout de la colonne :
--   psql -d <base> -f database/migrations/001_queue_pause_reason.sql

ALTER TABLE queues
    ADD COLUMN IF NOT EXISTS pause_reason VARCHAR(20);

ALTER TABLE queues
    DROP CONSTRAINT IF EXISTS queues_pause_reason_valid;

ALTER TABLE queues
    ADD CONSTRAINT queues_pause_reason_valid
        CHECK (
            pause_reason IS NULL
            OR (status = 'PAUSED' AND pause_reason = 'NEXT_DAY')
        );
