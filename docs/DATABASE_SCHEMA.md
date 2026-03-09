# Database Schema Documentation

## Overview

The Survey Application uses PostgreSQL as its database. The schema is designed to handle user management, survey creation, response collection, and analytics. All tables use numeric IDs as primary keys with timestamps for audit trails.

## Table Descriptions

### 1. **users** Table
Stores user account information and authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| name | VARCHAR(255) | NOT NULL | User's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypted password hash |
| role | user_role | DEFAULT 'user' | Admin or User role |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**ENUM:** `user_role = ('admin', 'user')`

---

### 2. **surveys** Table
Contains survey metadata and definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique survey identifier |
| title | VARCHAR(255) | NOT NULL | Survey title |
| description | TEXT | - | Survey description |
| created_by | INTEGER | NOT NULL, FK | User who created the survey |
| status | survey_status | DEFAULT 'draft' | Current status of survey |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**ENUM:** `survey_status = ('draft', 'published', 'closed')`
**Foreign Key:** `created_by` → `users.id` (CASCADE DELETE)
**Index:** `idx_surveys_created_by`

---

### 3. **questions** Table
Stores individual questions within surveys.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique question identifier |
| survey_id | INTEGER | NOT NULL, FK | Parent survey |
| question_text | TEXT | NOT NULL | The question content |
| question_type | question_type | NOT NULL | Type of question |
| is_required | BOOLEAN | DEFAULT true | Whether answer is required |
| order_index | INTEGER | - | Display order in survey |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**ENUM:** `question_type = ('multiple_choice', 'text', 'rating', 'checkbox')`
**Foreign Key:** `survey_id` → `surveys.id` (CASCADE DELETE)
**Index:** `idx_questions_survey_id`

---

### 4. **options** Table
Stores answer options for multiple_choice and checkbox questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique option identifier |
| question_id | INTEGER | NOT NULL, FK | Parent question |
| option_text | VARCHAR(255) | NOT NULL | The option text |
| order_index | INTEGER | - | Display order |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Foreign Key:** `question_id` → `questions.id` (CASCADE DELETE)
**Index:** `idx_options_question_id`

---

### 5. **responses** Table
Tracks each survey submission (one entry per user per survey).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique response identifier |
| survey_id | INTEGER | NOT NULL, FK | Survey being responded to |
| user_id | INTEGER | NOT NULL, FK | User submitting response |
| submitted_at | TIMESTAMP | DEFAULT NOW() | Submission time |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Foreign Keys:**
- `survey_id` → `surveys.id` (CASCADE DELETE)
- `user_id` → `users.id` (CASCADE DELETE)

**Constraints:** `UNIQUE(survey_id, user_id)` - Prevents duplicate submissions
**Indexes:**
- `idx_responses_survey_id`
- `idx_responses_user_id`

---

### 6. **answers** Table
Stores individual question answers within a response.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique answer identifier |
| response_id | INTEGER | NOT NULL, FK | The response this answer belongs to |
| question_id | INTEGER | NOT NULL, FK | The question being answered |
| answer_text | TEXT | - | Text answer (for open-ended questions) |
| option_id | INTEGER | FK | Selected option (for choice-based) |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Foreign Keys:**
- `response_id` → `responses.id` (CASCADE DELETE)
- `question_id` → `questions.id` (CASCADE DELETE)
- `option_id` → `options.id` (SET NULL)

**Indexes:**
- `idx_answers_response_id`
- `idx_answers_question_id`

---

### 7. **articles** Table
Stores published articles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique article identifier |
| title | VARCHAR(255) | NOT NULL | Article title |
| content | TEXT | NOT NULL | Article content (HTML or markdown) |
| author | INTEGER | NOT NULL, FK | Author user ID |
| is_published | BOOLEAN | DEFAULT false | Publication status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Foreign Key:** `author` → `users.id` (CASCADE DELETE)
**Index:** `idx_articles_author`

---

## Key Design Decisions

### 1. **Duplicate Response Prevention**
The `UNIQUE(survey_id, user_id)` constraint on the `responses` table prevents users from submitting multiple responses to the same survey.

### 2. **Flexible Answer Storage**
The `answers` table supports:
- Text answers via `answer_text` (for text/rating questions)
- Option-based answers via `option_id` (for multiple choice/checkbox)

### 3. **Cascading Deletes**
When a survey is deleted, all associated questions, options, responses, and answers are automatically deleted.

### 4. **Indexing Strategy**
Foreign keys are indexed for fast lookups in queries that filter by:
- Surveys by creator
- Questions by survey
- Responses by survey or user
- Answers by response or question

### 5. **Timestamps**
All tables include `created_at` and `updated_at` timestamps for audit trails and sorting.

### 6. **ENUM Types**
PostgreSQL ENUM types enforce valid values:
- User roles: admin, user
- Survey status: draft, published, closed
- Question types: multiple_choice, text, rating, checkbox

---

## Sample Queries

### Get All Responses for a Survey
```sql
SELECT r.id, u.name, r.submitted_at
FROM responses r
JOIN users u ON r.user_id = u.id
WHERE r.survey_id = 1
ORDER BY r.submitted_at DESC;
```

### Get All Answers for a Response
```sql
SELECT q.question_text, a.answer_text, o.option_text
FROM answers a
JOIN questions q ON a.question_id = q.id
LEFT JOIN options o ON a.option_id = o.id
WHERE a.response_id = 1;
```

### Count Responses per Survey
```sql
SELECT s.title, COUNT(r.id) as response_count
FROM surveys s
LEFT JOIN responses r ON s.id = r.survey_id
GROUP BY s.id, s.title
ORDER BY response_count DESC;
```

### Get Most Selected Option
```sql
SELECT o.option_text, COUNT(a.id) as count
FROM answers a
JOIN options o ON a.option_id = o.id
WHERE a.question_id = 3
GROUP BY o.id, o.option_text
ORDER BY count DESC;
```

---

## Notes

- All IDs use SERIAL type (auto-incrementing integers)
- Passwords should be hashed using bcryptjs before insertion
- The schema supports horizontal scaling through proper indexing
- Future versions may add soft deletes with `deleted_at` timestamps
