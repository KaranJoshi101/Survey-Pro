-- Minimal valid seed data for InsightForge Postgres database
-- One admin user with related survey, article, and consulting service records

-- Clean up existing data (in reverse order of dependencies)
DELETE FROM media_posts;
DELETE FROM platform_events;
DELETE FROM consulting_events;
DELETE FROM consulting_requests;
DELETE FROM signup_otp_verifications;
DELETE FROM responses;
DELETE FROM answers;
DELETE FROM playlist_items;
DELETE FROM training_playlists;
DELETE FROM training_videos;
DELETE FROM training_categories;
DELETE FROM options;
DELETE FROM questions;
DELETE FROM articles;
DELETE FROM surveys;
DELETE FROM consulting_services;
DELETE FROM users;

-- Insert admin user
INSERT INTO users (name, email, password_hash, role, is_banned)
VALUES ('manoj diwakar', 'manojkumar@jnu.ac.in', '$2a$10$MsgIT.W1iRFzPH1JbrU.weQTJ2BF.4i6JoEalNhzX/kD6Hi2.UNAi', 'admin', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Insert a sample survey
INSERT INTO surveys (title, slug, description, created_by, status, allow_multiple_submissions, is_anonymous, collect_email, created_at, updated_at)
WITH admin AS (SELECT id FROM users WHERE email = 'manojkumar@jnu.ac.in' LIMIT 1)
SELECT 'Minimal Survey', 'minimal-survey', 'Minimal valid survey seed.', admin.id, 'draft', FALSE, FALSE, FALSE, NOW(), NOW()
FROM admin
ON CONFLICT (slug) DO NOTHING;

-- Insert a sample question
INSERT INTO questions (survey_id, question_text, question_type, is_required, order_index, created_at)
WITH survey AS (SELECT id FROM surveys WHERE slug = 'minimal-survey' LIMIT 1)
SELECT survey.id, 'What is your feedback?', 'text', TRUE, 1, NOW()
FROM survey
ON CONFLICT DO NOTHING;

-- Insert a sample article
INSERT INTO articles (title, slug, content, author, is_published, meta_description, tags, reading_time_minutes, created_at, updated_at)
WITH admin AS (SELECT id FROM users WHERE email = 'manojkumar@jnu.ac.in' LIMIT 1)
SELECT 'Minimal Article', 'minimal-article', 'Minimal valid article seed.', admin.id, FALSE, 'Minimal valid article seed.', 'seed', 1, NOW(), NOW()
FROM admin
ON CONFLICT (slug) DO NOTHING;

-- Insert secondary survey
INSERT INTO surveys (title, slug, description, created_by, status, allow_multiple_submissions, is_anonymous, collect_email, created_at, updated_at)
WITH admin AS (SELECT id FROM users WHERE email = 'manojkumar@jnu.ac.in' LIMIT 1)
SELECT 'Secondary Survey', 'secondary-survey', 'Secondary survey without media association.', admin.id, 'published', TRUE, TRUE, TRUE, NOW(), NOW()
FROM admin
ON CONFLICT (slug) DO NOTHING;

-- Insert sample question for secondary survey
INSERT INTO questions (survey_id, question_text, question_type, is_required, order_index, created_at)
WITH survey AS (SELECT id FROM surveys WHERE slug = 'secondary-survey' LIMIT 1)
SELECT survey.id, 'Rate your experience?', 'rating', FALSE, 1, NOW()
FROM survey
ON CONFLICT DO NOTHING;

-- Insert secondary article
INSERT INTO articles (title, slug, content, author, is_published, meta_description, tags, reading_time_minutes, created_at, updated_at)
WITH admin AS (SELECT id FROM users WHERE email = 'manojkumar@jnu.ac.in' LIMIT 1)
SELECT 'Secondary Article', 'secondary-article', 'Secondary article without media association.', admin.id, TRUE, 'Secondary article seed.', 'seed,article', 2, NOW(), NOW()
FROM admin
ON CONFLICT (slug) DO NOTHING;

-- Insert consulting service
INSERT INTO consulting_services (title, slug, short_description, content, is_active, created_at)
SELECT 'Minimal Consulting Service', 'minimal-consulting-service', 'Minimal valid consulting service seed.', 'Minimal valid consulting service seed.', TRUE, NOW()
ON CONFLICT (slug) DO NOTHING;

-- Insert training category
INSERT INTO training_categories (name, description, display_order, is_active, created_at)
SELECT 'Minimal Training Category', 'Minimal valid training category seed.', 1, TRUE, NOW()
ON CONFLICT (name) DO NOTHING;

-- Insert training video
INSERT INTO training_videos (title, youtube_id, duration_minutes, description, is_active, created_at)
SELECT 'Minimal Video', 'dQw4w9WgXcQ', 3, 'Minimal training video seed.', TRUE, NOW()
ON CONFLICT (youtube_id) DO NOTHING;

-- Insert training playlist
INSERT INTO training_playlists (name, description, is_active, created_at)
SELECT 'Minimal Playlist', 'Minimal training playlist seed.', TRUE, NOW()
ON CONFLICT DO NOTHING;
