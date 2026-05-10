-- Minimal valid seed data for the full InsightForge MySQL database
-- One admin only; all other rows are the smallest valid sample records needed to satisfy relations.

-- Clean up existing data (in reverse order of dependencies)
DELETE FROM media_posts;
DELETE FROM article_drafts;
DELETE FROM survey_drafts;
DELETE FROM training_notes;
DELETE FROM playlist_items;
DELETE FROM training_playlists;
DELETE FROM training_videos;
DELETE FROM training_categories;
DELETE FROM consulting_services;
DELETE FROM articles;
DELETE FROM questions;
DELETE FROM surveys;
DELETE FROM users;

INSERT INTO users (name, email, password_hash, role)
VALUES ('manoj diwakar', 'manojkumar@jnu.ac.in', '$2a$10$MsgIT.W1iRFzPH1JbrU.weQTJ2BF.4i6JoEalNhzX/kD6Hi2.UNAi', 'admin');
SET @admin_id := LAST_INSERT_ID();

INSERT INTO surveys (title, slug, description, created_by, status, allow_multiple_submissions, is_anonymous, collect_email)
VALUES ('Minimal Survey', 'minimal-survey', 'Minimal valid survey seed.', @admin_id, 'draft', FALSE, FALSE, FALSE);
SET @survey_id := LAST_INSERT_ID();

INSERT INTO questions (survey_id, question_text, question_type, is_required, order_index)
VALUES (@survey_id, 'What is your feedback?', 'text', TRUE, 1);
SET @question_id := LAST_INSERT_ID();

INSERT INTO articles (title, slug, content, author, is_published, meta_description, tags, reading_time_minutes)
VALUES ('Minimal Article', 'minimal-article', 'Minimal valid article seed.', @admin_id, FALSE, 'Minimal valid article seed.', 'seed', 1);
SET @article_id := LAST_INSERT_ID();

INSERT INTO surveys (title, slug, description, created_by, status, allow_multiple_submissions, is_anonymous, collect_email)
VALUES ('Secondary Survey', 'secondary-survey', 'Secondary survey without media association.', @admin_id, 'published', TRUE, TRUE, TRUE);
SET @survey_id_2 := LAST_INSERT_ID();

INSERT INTO questions (survey_id, question_text, question_type, is_required, order_index)
VALUES (@survey_id_2, 'Rate your experience?', 'rating', FALSE, 1);

INSERT INTO articles (title, slug, content, author, is_published, meta_description, tags, reading_time_minutes)
VALUES ('Secondary Article', 'secondary-article', 'Secondary article without media association.', @admin_id, TRUE, 'Secondary article seed.', 'seed,article', 2);
SET @article_id_2 := LAST_INSERT_ID();

INSERT INTO consulting_services (title, slug, short_description, content, is_active)
VALUES ('Minimal Consulting Service', 'minimal-consulting-service', 'Minimal valid consulting service seed.', 'Minimal valid consulting service seed.', TRUE);
SET @service_id := LAST_INSERT_ID();

INSERT INTO training_categories (name, description, display_order, is_active)
VALUES ('General', 'Minimal valid training category seed.', 1, TRUE);
SET @category_id := LAST_INSERT_ID();

INSERT INTO training_videos (title, description, youtube_id, duration_minutes, display_order, is_active)
VALUES ('Minimal Training Video', 'Minimal valid training video seed.', 'dQw4w9WgXcQ', 1, 1, TRUE);
SET @video_id := LAST_INSERT_ID();

INSERT INTO training_playlists (category_id, name, description, display_order, is_active, youtube_playlist_url)
VALUES (@category_id, 'Minimal Playlist', 'Minimal valid training playlist seed.', 1, TRUE, 'https://www.youtube.com/playlist?list=PL00000000000000000000000000000000');
SET @playlist_id := LAST_INSERT_ID();

INSERT INTO playlist_items (playlist_id, video_id, order_index)
VALUES (@playlist_id, @video_id, 1);

INSERT INTO training_notes (category_id, title, document_url, display_order, is_active)
VALUES (@category_id, 'Minimal Note', NULL, 1, TRUE);

INSERT INTO survey_drafts (survey_id, user_id, title, description, questions, survey_settings)
VALUES (@survey_id, @admin_id, 'Minimal Draft', 'Minimal valid survey draft seed.', JSON_ARRAY(), JSON_OBJECT());

INSERT INTO article_drafts (article_id, user_id, title, content, meta_description, tags)
VALUES (@article_id, @admin_id, 'Minimal Draft Article', 'Minimal valid article draft seed.', 'Minimal article draft seed.', 'seed');

INSERT INTO media_posts (title, description, image_url, size, source, survey_id, article_id)
VALUES ('Minimal Media Post', 'Minimal valid media post seed.', 'https://via.placeholder.com/600x400?text=Seed', 'medium', 'manual', @survey_id, @article_id);
