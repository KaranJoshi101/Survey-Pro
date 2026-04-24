-- Step 22: Ensure feedback/talk records are always published

-- Feedback surveys must remain published
UPDATE surveys s
SET status = 'published'::survey_status,
    updated_at = NOW()
WHERE s.status <> 'published'::survey_status
  AND EXISTS (
      SELECT 1
      FROM media_posts mp
      WHERE mp.survey_id = s.id
  );

-- Talk articles must remain published
UPDATE articles a
SET is_published = true,
    updated_at = NOW()
WHERE a.is_published = false
  AND EXISTS (
      SELECT 1
      FROM media_posts mp
      WHERE mp.article_id = a.id
  );

-- Linked media items must remain published
UPDATE media_posts mp
SET status = 'published'::media_status,
    updated_at = CURRENT_TIMESTAMP
WHERE mp.status <> 'published'::media_status
  AND (mp.survey_id IS NOT NULL OR mp.article_id IS NOT NULL);
