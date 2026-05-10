# InsightForge

Survey and content platform built with MySQL, Express, React, and Node.js.

## Features

- JWT authentication (user/admin roles)
- Survey creation, publishing, response collection, and exports
- Survey analytics (question-level + demographics)
- Article publishing and management (rich text)
- Media feed administration
- Media draft/publish lifecycle with admin publish/unpublish controls
- Linked media behavior: surveys become Feedback and articles become Talks while linked
- Profile management with secure password change flow
- Training category, playlist, and notes administration
- Consulting services and authenticated consultation request workflow
- Consulting analytics with period selector (`7d`, `30d`, `all`)
- Admin dashboard for users, surveys, responses, content, and consulting
- SEO slugs, scheduled article publishing, and draft autosave support
- Platform and consulting event tracking with session-based analytics
- OTP-gated registration and live ban enforcement on authenticated requests

## Tech Stack

- Backend: Node.js, Express, MySQL via `mysql2/promise`
- Frontend: React (CRA + CRACO)
- Auth: JWT + bcrypt
- Ops: PM2, Nodemon, health checks, and smoke tests

## Project Structure

```text
insightforge/
  client/      React frontend
  server/      Express API
  database/    SQL migrations, seed scripts, and consolidated master schema
  docs/        Project documentation
```

## Image Storage

Use two image locations depending on the use case:

- Static frontend assets (landing/profile/fixed article visuals):
  `client/public/static/images/...`
- Runtime article uploads (admin-managed):
  `server/uploads/articles/...`

Public URL patterns:

- Frontend static: `/static/images/<subfolder>/<file-name>`
- Backend uploads: `${REACT_APP_API_URL or API base}/uploads/articles/<file-name>`

Details and examples: `docs/IMAGE_STORAGE.md`

## Master Project Specification

For a single consolidated source containing architecture, use cases, DFD inputs, sequence flows, API inventory, database schema, and UML component mapping, use:

`docs/MASTER_PROJECT_DIAGRAM_SPEC.md`

For a complete operational and implementation-oriented master document (setup, scripts, architecture, modules, deployment, and documentation map), use:

`docs/PROJECT_DOCUMENTATION.md`

For the complete consolidated migration script, use:

`database/master_migrations.sql`

## Deployment

Deployment checklist and production setup are documented in:

`docs/DEPLOYMENT.md`

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

## Environment Setup

Create a `.env` file in the project root (`insightforge/.env`) with values like:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=insightforge
DB_USER=root
DB_PASSWORD=your_password
DB_SSL=false

SERVER_PORT=5000
NODE_ENV=development
TRUST_PROXY=0

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=1h

CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=20

REACT_APP_API_URL=http://localhost:5000/api

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM_EMAIL=your_email
SMTP_FROM_NAME=InsightForge
```

For production, use:

- `.env.production.example` as the template
- `docs/DEPLOYMENT.md` for full runbook

## Install Dependencies

From the root folder:

```bash
npm run install-all
```

## Database Setup

Option 1: Run init script (creates DB and runs schema/seed)

```bash
npm run db:init
```

Option 2: Manual SQL setup

```bash
mysql -u root -p
CREATE DATABASE insightforge;
USE insightforge;
SOURCE database/mysql/schema.sql;
SOURCE database/seeds/seed_data.sql;
```

If you want the full schema in one file, use `database/master_migrations.sql` instead of the split migration set.

## Run The Project

Run both frontend and backend:

```bash
npm run dev
```

Or run separately:

```bash
npm run server
npm run client
```

App URLs:

- Frontend: `http://localhost:3000`
- API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Useful Scripts

- `npm run dev` - Run server and client together
- `npm run server` - Run backend only
- `npm run client` - Run frontend only
- `npm run build` - Build frontend for production
- `npm run smoke` - Run post-deploy smoke checks (health/login/build artifact)
- `npm start` - Start backend in production mode
- `npm run pm2:start` - Start backend with PM2 using `ecosystem.config.js`
- `npm run pm2:restart` - Restart PM2 app and refresh env
- `npm run pm2:stop` - Stop PM2 app
- `npm run db:init` - Initialize database
- `npm run seed:consulting` - Seed consulting requests and events
- `npm run verify:consulting-seed` - Verify consulting seed data
- `npm run db:sync:prod` - Backup production DB, sync local DB to production, and verify counts
- `npm run install-all` - Install root/server/client dependencies

## Admin Routes (Current)

- `/admin`
- `/admin/surveys`
- `/admin/surveys/create`
- `/admin/surveys/:id/edit`
- `/admin/surveys/:id/analytics`
- `/admin/responses`
- `/admin/users`
- `/admin/articles`
- `/admin/media`
- `/admin/training`
- `/admin/consulting`
- `/admin/consulting/analytics`

Note: unified analytics route `/admin/analytics` is currently disabled in the app router.

## Verified Migration Notes

- Runtime validation is based on the MySQL connection pool in `server/config/database.js`.
- The schema is available both as split migrations and as the consolidated `database/master_migrations.sql` file.
- Live session tracking, consulting events, and platform events are stored in MySQL rather than Redis or an external cache.
- The admin/protected regression matrix was revalidated on a fresh API instance after a stale port conflict was detected.

## Push To GitHub

From `insightforge/`:

```bash
git add .
git commit -m "Prepare project for GitHub"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If `origin` already exists, update it:

```bash
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
