-- Step 21: Add draft/published lifecycle to media posts

DO $$
BEGIN
    CREATE TYPE media_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE media_posts
    ADD COLUMN status media_status;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Backfill old rows so current public behavior remains unchanged for existing media.
UPDATE media_posts
SET status = 'published'::media_status
WHERE status IS NULL;

DO $$
BEGIN
    ALTER TABLE media_posts
    ALTER COLUMN status SET DEFAULT 'draft';
EXCEPTION WHEN undefined_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE media_posts
    ALTER COLUMN status SET NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_media_posts_status_created_at
    ON media_posts(status, created_at DESC);
