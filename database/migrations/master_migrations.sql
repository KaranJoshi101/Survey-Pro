-- ============================================================================
-- MASTER MIGRATIONS FILE
-- Complete database schema for InsightForge Platform
-- All migrations combined in sequence (01 through 26)
-- ============================================================================

-- ============================================================================
-- MIGRATION 01: Initial Schema
-- ============================================================================

-- Step 1: Design Database
-- InsightForge Database Schema

-- Create ENUM types (if not exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('multiple_choice', 'text', 'rating', 'checkbox');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE survey_status AS ENUM ('draft', 'published', 'closed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    status survey_status DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    is_required BOOLEAN DEFAULT true,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);

-- Options Table (for multiple_choice and checkbox questions)
CREATE TABLE IF NOT EXISTS options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Responses Table (tracks each survey submission)
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(survey_id, user_id)
);

-- Answers Table (individual question answers within a response)
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    response_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_text TEXT,
    option_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE SET NULL
);

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON responses(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_response_id ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);

-- ============================================================================
-- MIGRATION 02: Add is_banned
-- ============================================================================

-- Add is_banned column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Create index for efficient banned user lookups
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned);

-- ============================================================================
-- MIGRATION 03: Add Profile Fields
-- ============================================================================

-- Migration: Add profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- ============================================================================
-- MIGRATION 04: Add Question Type Filters
-- ============================================================================

-- Add additional question types for filtered free-text inputs
DO $$ BEGIN
  ALTER TYPE question_type ADD VALUE 'text_only';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE question_type ADD VALUE 'number_only';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- MIGRATION 05: Add Media Posts
-- ============================================================================

-- Step 5: Add Media Posts Table for Social Media Wall

-- Create ENUM types for media posts (if not exists)
DO $$ BEGIN
  CREATE TYPE media_source AS ENUM ('manual', 'linkedin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE media_size AS ENUM ('small', 'medium', 'large');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Media Posts Table
CREATE TABLE IF NOT EXISTS media_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    size media_size DEFAULT 'medium',
    source media_source DEFAULT 'manual',
    external_id VARCHAR(255) UNIQUE, -- For LinkedIn post IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_media_posts_created_at ON media_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_posts_source ON media_posts(source);
CREATE INDEX IF NOT EXISTS idx_media_posts_external_id ON media_posts(external_id);

-- ============================================================================
-- MIGRATION 06: Add Media Details and Survey Support
-- ============================================================================

-- Step 6: Add Details and Survey Support to Media Posts

-- Add columns to media_posts table
DO $$ 
BEGIN
    ALTER TABLE media_posts
    ADD COLUMN details TEXT DEFAULT NULL;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$ 
BEGIN
    ALTER TABLE media_posts
    ADD COLUMN survey_id INT DEFAULT NULL;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add foreign key constraint for survey_id
DO $$
BEGIN
    ALTER TABLE media_posts
    ADD CONSTRAINT fk_media_posts_survey_id 
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create index for survey lookups
CREATE INDEX IF NOT EXISTS idx_media_posts_survey_id ON media_posts(survey_id);

-- ============================================================================
-- MIGRATION 07: Refactor Media to Use Article ID
-- ============================================================================

-- Step 7: Replace details with article_id reference

-- Add article_id column to media_posts
DO $$ 
BEGIN
    ALTER TABLE media_posts
    ADD COLUMN article_id INT DEFAULT NULL;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Remove old details column if it exists
DO $$
BEGIN
    ALTER TABLE media_posts
    DROP COLUMN details;
EXCEPTION WHEN undefined_column THEN null;
END $$;

-- Add foreign key constraint for article_id
DO $$
BEGIN
    ALTER TABLE media_posts
    ADD CONSTRAINT fk_media_posts_article_id 
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create index for article lookups
CREATE INDEX IF NOT EXISTS idx_media_posts_article_id ON media_posts(article_id);

-- ============================================================================
-- MIGRATION 08: Create Training Videos
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    youtube_id VARCHAR(32) NOT NULL UNIQUE,
    duration_minutes INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_videos_active_order
    ON training_videos (is_active, display_order, id);

CREATE INDEX IF NOT EXISTS idx_training_videos_created_at
    ON training_videos (created_at DESC);

INSERT INTO training_videos (title, description, youtube_id, duration_minutes, display_order, is_active)
VALUES
    ('Survey Design Fundamentals', 'Learn how to design reliable and research-ready surveys from the ground up.', 'R7vmHGAshi8', 16, 1, true),
    ('How to Analyze Survey Data', 'A practical walkthrough of common methods for quantitative survey analysis.', '8MBCYXWlvqk', 21, 2, true),
    ('Avoiding Bias in Questionnaires', 'Understand response bias, wording effects, and how to improve question quality.', 'Ytt6WZf0Wn8', 14, 3, true)
ON CONFLICT (youtube_id) DO NOTHING;

-- ============================================================================
-- MIGRATION 09: Create Training Playlists
-- ============================================================================

-- Create training playlists and playlist items tables

CREATE TABLE IF NOT EXISTS training_playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlist_items (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER NOT NULL,
    video_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES training_playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES training_videos(id) ON DELETE CASCADE,
    UNIQUE(playlist_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_playlists_active_order
    ON training_playlists (is_active, display_order, id);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist
    ON playlist_items (playlist_id, order_index);

-- Insert sample playlists
INSERT INTO training_playlists (name, description, display_order, is_active)
VALUES
    ('SaaS Tutorial Series', 'Comprehensive guide to Software as a Service concepts', 1, true),
    ('R Programming Fundamentals', 'Learn R programming from basics to advanced techniques', 2, true),
    ('Survey Design & Analysis', 'Complete training on survey methodology', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION 10: Add YouTube Playlist URL
-- ============================================================================

-- Add youtube_playlist_url column to training_playlists table

ALTER TABLE training_playlists ADD COLUMN youtube_playlist_url VARCHAR(500);

-- ============================================================================
-- MIGRATION 11: Add Survey Submission Email Fields
-- ============================================================================

-- Add configurable submission email template fields to surveys

ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS submission_email_subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS submission_email_body TEXT,
ADD COLUMN IF NOT EXISTS submission_email_attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ============================================================================
-- MIGRATION 12: Add Signup OTP Verifications
-- ============================================================================

-- Add OTP verification storage for sign-up flow

CREATE TABLE IF NOT EXISTS signup_otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_signup_otp_email
    ON signup_otp_verifications (email);

CREATE INDEX IF NOT EXISTS idx_signup_otp_expires_at
    ON signup_otp_verifications (expires_at);

-- ============================================================================
-- MIGRATION 13: Add Training Categories and Notes
-- ============================================================================

-- Add training categories and category notes (documents)

CREATE TABLE IF NOT EXISTS training_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE training_playlists
    ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES training_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_training_playlists_category
    ON training_playlists (category_id, is_active, display_order, id);

CREATE TABLE IF NOT EXISTS training_notes (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES training_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_url VARCHAR(1000),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_notes_category
    ON training_notes (category_id, is_active, display_order, id);

-- ============================================================================
-- MIGRATION 14: Drop Unused Fields
-- ============================================================================

-- Migration to drop unused profile fields from users table and remove content from training_notes
ALTER TABLE training_notes DROP COLUMN IF EXISTS content;

-- ============================================================================
-- MIGRATION 15: Add Consulting Services
-- ============================================================================

-- Consulting services and lead capture module

CREATE TABLE IF NOT EXISTS consulting_services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    content TEXT NOT NULL,
    deliverables TEXT,
    target_audience TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consulting_services_active
    ON consulting_services (is_active);

CREATE TABLE IF NOT EXISTS consulting_requests (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES consulting_services(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    file_url VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consulting_requests_service
    ON consulting_requests (service_id);

CREATE INDEX IF NOT EXISTS idx_consulting_requests_created
    ON consulting_requests (created_at DESC);

INSERT INTO consulting_services (title, slug, short_description, content, deliverables, target_audience, is_active)
VALUES
(
    'Protocol Development',
    'protocol-development',
    'Design robust clinical and research protocols with clear objectives, endpoints, and analysis readiness.',
    '<p>We partner with your team to develop statistically sound, regulator-ready protocols that align scientific intent with operational feasibility. Our approach covers objective framing, endpoint definition, inclusion and exclusion criteria, visit schedules, and risk-aware statistical thinking from day one.</p><p>The output is a clear protocol foundation that accelerates approvals and reduces downstream rework across biostatistics, medical writing, and operations.</p>',
    '<ul><li>Protocol framework and endpoint mapping</li><li>Statistical considerations section</li><li>Assumption log and risk notes</li><li>Review-ready revision package</li></ul>',
    '<ul><li>Clinical researchers</li><li>Academic investigators</li><li>Biotech trial teams</li></ul>',
    true
),
(
    'Statistical Data Analysis Plan',
    'statistical-data-analysis-plan',
    'Develop complete SAP documents translating protocol goals into executable statistical methods.',
    '<p>Our Statistical Analysis Plan service converts protocol intent into an auditable and implementation-ready analysis blueprint. We define populations, handling rules, missing data strategy, model choices, sensitivity analyses, and output conventions.</p><p>This ensures your data management, programming, and reporting teams work from a unified source of truth.</p>',
    '<ul><li>Comprehensive SAP document</li><li>Population and endpoint analysis definitions</li><li>Missing data and sensitivity strategy</li><li>Output shells alignment notes</li></ul>',
    '<ul><li>Biostatistics teams</li><li>CRO sponsors</li><li>Clinical operations leads</li></ul>',
    true
),
(
    'Sample Size & Power Analysis',
    'sample-size-power-analysis',
    'Quantify sample requirements and power trade-offs for defensible and cost-efficient study designs.',
    '<p>We perform rigorous sample size and power analyses tailored to your endpoint type, expected effect size, design constraints, and attrition expectations. Outputs are decision-oriented and explainable for protocol committees and ethics submissions.</p><p>Where uncertainty is high, we include scenario analyses to guide practical enrollment planning.</p>',
    '<ul><li>Sample size assumptions table</li><li>Power scenarios and interpretation memo</li><li>Dropout-adjusted enrollment recommendation</li><li>Design option comparison summary</li></ul>',
    '<ul><li>Principal investigators</li><li>Grant applicants</li><li>Clinical study planners</li></ul>',
    true
),
(
    'TLF Development (Tables, Listings, Figures)',
    'tlf-development',
    'Design publication-ready and regulatory-friendly TLF shells and specifications for reporting workflows.',
    '<p>We create standardized TLF structures that map directly to study objectives, SAP definitions, and stakeholder reporting expectations. The service improves consistency between analysis, programming, and final reporting.</p><p>From shell design to traceability notes, we ensure each output supports interpretation and decision-making.</p>',
    '<ul><li>TLF shell package</li><li>Numbering and labeling conventions</li><li>Metadata and traceability notes</li><li>Programming handoff checklist</li></ul>',
    '<ul><li>Statistical programmers</li><li>Medical writers</li><li>Regulatory submission teams</li></ul>',
    true
),
(
    'Research Methodology',
    'research-methodology',
    'Strengthen study methodology across design, bias control, and analytical strategy alignment.',
    '<p>We help teams refine overall methodological architecture so that design, sampling, measurement, and analysis choices remain coherent and defensible. This includes support for observational, experimental, and mixed-method contexts.</p><p>The result is stronger internal validity, clearer causal reasoning, and improved review outcomes.</p>',
    '<ul><li>Methodology review and gap report</li><li>Design refinement recommendations</li><li>Bias and confounder mitigation plan</li><li>Method section drafting support</li></ul>',
    '<ul><li>Academic researchers</li><li>Policy and social science teams</li><li>Clinical methodologists</li></ul>',
    true
),
(
    'Report Writing',
    'report-writing',
    'Convert technical analyses into clear, decision-oriented reports for academic, clinical, and business stakeholders.',
    '<p>We provide structured report writing support that translates complex statistical outputs into clear narratives with defensible interpretation. Reports are tailored to stakeholder context while preserving methodological rigor.</p><p>We can support full report drafting or targeted sections such as methods, results, and discussion.</p>',
    '<ul><li>Structured report draft</li><li>Results narrative with statistical interpretation</li><li>Figure/table integration guidance</li><li>Revision support rounds</li></ul>',
    '<ul><li>Research teams</li><li>Healthcare organizations</li><li>Consulting and analytics teams</li></ul>',
    true
),
(
    'Statistical Input in Manuscript',
    'statistical-input-in-manuscript',
    'Provide expert statistical review and writing support for manuscripts before submission.',
    '<p>We review manuscript drafts to strengthen statistical framing, methods transparency, results interpretation, and reviewer resilience. Feedback focuses on alignment between claims, analyses, and limitations.</p><p>This improves submission confidence and reduces revision cycles related to statistical critique.</p>',
    '<ul><li>Statistical review comments</li><li>Methods and results edits</li><li>Reviewer response support</li><li>Submission-readiness checklist</li></ul>',
    '<ul><li>Authors and co-authors</li><li>Academic labs</li><li>Medical publication teams</li></ul>',
    true
)
ON CONFLICT (slug) DO UPDATE
SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    content = EXCLUDED.content,
    deliverables = EXCLUDED.deliverables,
    target_audience = EXCLUDED.target_audience,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- MIGRATION 16: Add Consulting Hero Fields
-- ============================================================================

ALTER TABLE consulting_services
    ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;

ALTER TABLE consulting_services
    ADD COLUMN IF NOT EXISTS hero_benefits JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE consulting_services
SET hero_subtitle = COALESCE(NULLIF(TRIM(hero_subtitle), ''), short_description)
WHERE hero_subtitle IS NULL OR TRIM(hero_subtitle) = '';

-- ============================================================================
-- MIGRATION 17: Add Consulting Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS consulting_events (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES consulting_services(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'submit')),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consulting_events_service_id
    ON consulting_events (service_id);

CREATE INDEX IF NOT EXISTS idx_consulting_events_event_type
    ON consulting_events (event_type);

CREATE INDEX IF NOT EXISTS idx_consulting_events_created_at
    ON consulting_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consulting_events_service_event_created
    ON consulting_events (service_id, event_type, created_at DESC);

-- ============================================================================
-- MIGRATION 18: Add Consulting Request Workflow Fields
-- ============================================================================

ALTER TABLE consulting_requests
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

ALTER TABLE consulting_requests
    ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE consulting_requests
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';

ALTER TABLE consulting_requests
    ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE consulting_requests
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE consulting_requests
SET status = 'new'
WHERE status IS NULL OR TRIM(status) = '';

UPDATE consulting_requests
SET priority = 'medium'
WHERE priority IS NULL OR TRIM(priority) = '';

ALTER TABLE consulting_requests
    DROP CONSTRAINT IF EXISTS chk_consulting_requests_status;

ALTER TABLE consulting_requests
    ADD CONSTRAINT chk_consulting_requests_status
    CHECK (status IN ('new', 'in_progress', 'waiting_user', 'resolved', 'closed'));

ALTER TABLE consulting_requests
    DROP CONSTRAINT IF EXISTS chk_consulting_requests_priority;

ALTER TABLE consulting_requests
    ADD CONSTRAINT chk_consulting_requests_priority
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

CREATE INDEX IF NOT EXISTS idx_consulting_requests_status
    ON consulting_requests (status);

CREATE INDEX IF NOT EXISTS idx_consulting_requests_priority
    ON consulting_requests (priority);

CREATE INDEX IF NOT EXISTS idx_consulting_requests_assigned_to
    ON consulting_requests (assigned_to);

-- ============================================================================
-- MIGRATION 19: Create Platform Events
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_platform_events_event_type
        CHECK (event_type IN ('page_view', 'survey_submit', 'consulting_view', 'consulting_request', 'article_view', 'media_view', 'training_view')),
    CONSTRAINT chk_platform_events_entity_type
        CHECK (entity_type IN ('survey', 'article', 'media', 'training', 'consulting', 'platform'))
);

CREATE INDEX IF NOT EXISTS idx_platform_events_event_type
    ON platform_events (event_type);

CREATE INDEX IF NOT EXISTS idx_platform_events_entity_type
    ON platform_events (entity_type);

CREATE INDEX IF NOT EXISTS idx_platform_events_entity_id
    ON platform_events (entity_id);

CREATE INDEX IF NOT EXISTS idx_platform_events_created_at
    ON platform_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_events_session_id
    ON platform_events (session_id);

CREATE INDEX IF NOT EXISTS idx_platform_events_entity_event_created
    ON platform_events (entity_type, event_type, created_at DESC);

-- ============================================================================
-- MIGRATION 20: Remove Consulting Request Assignment
-- ============================================================================

DROP INDEX IF EXISTS idx_consulting_requests_assigned_to;

ALTER TABLE consulting_requests
    DROP COLUMN IF EXISTS assigned_to;

-- ============================================================================
-- MIGRATION 21: Add Media Status
-- ============================================================================

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

-- ============================================================================
-- MIGRATION 22: Sync Feedback Talk Publish State
-- ============================================================================

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

-- ============================================================================
-- MIGRATION 23: Add Slug Fields
-- ============================================================================

-- Step 23: Add SEO slug fields for articles and surveys

DO $$
BEGIN
    ALTER TABLE articles
    ADD COLUMN slug VARCHAR(120);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE surveys
    ADD COLUMN slug VARCHAR(120);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Backfill article slugs with uniqueness handling.
WITH article_bases AS (
    SELECT
        id,
        COALESCE(NULLIF(regexp_replace(regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'), ''), 'article') AS base_slug
    FROM articles
), article_ranked AS (
    SELECT
        id,
        base_slug,
        ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY id) AS rn
    FROM article_bases
)
UPDATE articles a
SET slug = CASE
    WHEN ar.rn = 1 THEN ar.base_slug
    ELSE (ar.base_slug || '-' || ar.rn)
END
FROM article_ranked ar
WHERE a.id = ar.id
  AND (a.slug IS NULL OR a.slug = '');

-- Backfill survey slugs with uniqueness handling.
WITH survey_bases AS (
    SELECT
        id,
        COALESCE(NULLIF(regexp_replace(regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'), ''), 'survey') AS base_slug
    FROM surveys
), survey_ranked AS (
    SELECT
        id,
        base_slug,
        ROW_NUMBER() OVER (PARTITION BY base_slug ORDER BY id) AS rn
    FROM survey_bases
)
UPDATE surveys s
SET slug = CASE
    WHEN sr.rn = 1 THEN sr.base_slug
    ELSE (sr.base_slug || '-' || sr.rn)
END
FROM survey_ranked sr
WHERE s.id = sr.id
  AND (s.slug IS NULL OR s.slug = '');

DO $$
BEGIN
    ALTER TABLE articles
    ALTER COLUMN slug SET NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE surveys
    ALTER COLUMN slug SET NOT NULL;
EXCEPTION WHEN undefined_column THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug_unique ON articles(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_surveys_slug_unique ON surveys(slug);

-- ============================================================================
-- MIGRATION 24: Advanced Survey and Article Features
-- ============================================================================

-- Migration 24: Add advanced survey and article features

-- ===== SURVEY ENHANCEMENTS =====

-- Add conditional logic table for show/hide rules
CREATE TABLE IF NOT EXISTS survey_conditional_rules (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER NOT NULL,
    condition_question_id INTEGER NOT NULL,
    condition_value TEXT NOT NULL,
    target_question_id INTEGER NOT NULL,
    action VARCHAR(50) DEFAULT 'show',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (condition_question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (target_question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE(condition_question_id, target_question_id)
);

CREATE INDEX IF NOT EXISTS idx_survey_conditional_rules_survey_id
    ON survey_conditional_rules(survey_id);

-- Add survey settings
DO $$
BEGIN
    ALTER TABLE surveys
    ADD COLUMN IF NOT EXISTS allow_multiple_submissions BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE surveys
    ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE surveys
    ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE surveys
    ADD COLUMN IF NOT EXISTS collect_email BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add question enhancements
DO $$
BEGIN
    ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS description TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS help_text TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}'::jsonb;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Add partial response support
DO $$
BEGIN
    ALTER TABLE responses
    ADD COLUMN IF NOT EXISTS is_partial BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE responses
    ADD COLUMN IF NOT EXISTS last_question_index INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- ===== ARTICLE ENHANCEMENTS =====

DO $$
BEGIN
    ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS meta_description VARCHAR(160);
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS tags TEXT;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
    ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

-- Ensure articles have slug (for SEO)
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- ===== AUTOSAVE DRAFTS =====

CREATE TABLE IF NOT EXISTS survey_drafts (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER,
    user_id INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT,
    questions JSONB DEFAULT '[]'::jsonb,
    survey_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_survey_drafts_user_id
    ON survey_drafts(user_id);

CREATE INDEX IF NOT EXISTS idx_survey_drafts_survey_id
    ON survey_drafts(survey_id);

CREATE TABLE IF NOT EXISTS article_drafts (
    id SERIAL PRIMARY KEY,
    article_id INTEGER,
    user_id INTEGER NOT NULL,
    title VARCHAR(255),
    content TEXT,
    meta_description VARCHAR(160),
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_drafts_user_id
    ON article_drafts(user_id);

CREATE INDEX IF NOT EXISTS idx_article_drafts_article_id
    ON article_drafts(article_id);

-- ============================================================================
-- MIGRATION 25: Allow Multiple Submissions
-- ============================================================================

-- Migration 25: Support allow_multiple_submissions behavior

-- Remove the global unique submission constraint so per-survey setting can govern duplicates.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'responses_survey_id_user_id_key'
    ) THEN
        ALTER TABLE responses DROP CONSTRAINT responses_survey_id_user_id_key;
    END IF;
END $$;

-- Keep lookup performance for duplicate checks when allow_multiple_submissions = false.
CREATE INDEX IF NOT EXISTS idx_responses_survey_user_id
    ON responses (survey_id, user_id);

-- ============================================================================
-- MIGRATION 26: Add Article Scheduling
-- ============================================================================

-- Migration 26: Add article scheduling support

DO $$
BEGIN
    ALTER TABLE articles
    ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_articles_scheduled_publish_at
    ON articles(scheduled_publish_at);

-- ============================================================================
-- END OF MASTER MIGRATIONS
-- ============================================================================
