# 🚀 Setup Guide - Survey Application

Follow these steps to get your PERN stack survey application up and running.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (v12 or higher)
   - Download: https://www.postgresql.org/download/
   - Verify: `psql --version`

3. **Git** (optional, for version control)
   - Download: https://git-scm.com/

---

## Step 1: Verify PostgreSQL Installation

### On Windows:

1. Open Command Prompt or PowerShell
2. Verify PostgreSQL is installed:
   ```bash
   psql --version
   ```

3. Make sure PostgreSQL is running:
   - Check Services: Press `Win + R` → Type `services.msc`
   - Look for "postgresql-x64-xx" service
   - If not running, right-click and select "Start"

4. Test connection (default password is usually what you set during installation):
   ```bash
   psql -U postgres
   ```

5. If you see `postgres=#` prompt, PostgreSQL is working. Type `\q` to exit.

### On Mac:

```bash
brew services start postgresql@15
# or
pg_ctl -D /usr/local/var/postgres start
```

### On Linux:

```bash
sudo systemctl start postgresql
```

---

## Step 2: Configure Environment Variables

The `.env` file has been created with default values:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=survey_app
DB_USER=postgres
DB_PASSWORD=postgres
```

**If you used a different password for PostgreSQL**, edit `.env`:

```bash
# Edit the file (use your preferred editor)
# Windows: notepad .env
# Mac/Linux: nano .env

# Update the password line:
DB_PASSWORD=your_actual_postgres_password
```

---

## Step 3: Initialize the Database

Navigate to the project directory and run:

```bash
cd /d/softee/survey-app

# Initialize database (creates tables and seed data)
npm run db:init
```

### Expected Output:

```
🚀 Starting database initialization...

📦 Creating database...
✅ Database 'survey_app' created successfully

📋 Creating tables...
✅ Tables created successfully

🌱 Inserting seed data...
✅ Seed data inserted successfully

🎉 Database initialization completed successfully!
✨ Database: survey_app
✨ Host: localhost:5432
```

### Troubleshooting:

**Error: `role "postgres" does not exist`**
- PostgreSQL might not have a default postgres user
- You can check existing users in PostgreSQL:
  ```bash
  psql -l
  ```
- Update `.env` with your actual PostgreSQL username

**Error: `connect ECONNREFUSED 127.0.0.1:5432`**
- PostgreSQL is not running
- Windows: Start it from Services
- Mac/Linux: `brew services start postgresql` or `sudo systemctl start postgresql`

**Error: `FATAL: password authentication failed`**
- Wrong password in `.env`
- Reset password (or verify the correct one from installation)

---

## Step 4: Start the Application

### Option A: Run Both Server and Client Together

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

### Option B: Run Server and Client Separately

**Terminal 1 - Start Backend:**
```bash
npm run server
```
Expected: `Server is running on port 5000`

**Terminal 2 - Start Frontend:**
```bash
npm run client
```
Expected: Browser opens at http://localhost:3000

---

## Step 5: Verify Everything Works

1. **Backend**: Open http://localhost:5000/
   - Should show "Cannot GET /" (API not configured yet)

2. **Frontend**: Open http://localhost:3000/
   - Should load React app

3. **Database**: Check if tables were created:
   ```bash
   psql -U postgres -d survey_app
   # Then run:
   \dt
   # Should list all tables
   ```

---

## Project Structure Reference

```
survey-app/
├── server/              # Express.js backend
│   ├── config/         # Database & app config
│   ├── controllers/    # Route logic
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── models/         # Data models
│   └── utils/          # Helper functions
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── utils/      # Helper functions
│   └── public/         # Static files
├── database/           # Database files
│   ├── migrations/     # Schema files
│   ├── seeds/          # Seed data
│   └── init.js         # Database init script
├── docs/               # Documentation
├── .env                # Environment variables
└── package.json        # Root package config
```

---

## Common Commands

```bash
# Install all dependencies
npm install

# Install server dependencies only
cd server && npm install

# Install client dependencies only
cd client && npm install

# Initialize database
npm run db:init

# Run backend in development
npm run server

# Run frontend in development
npm run client

# Run both together
npm run dev
```

---

## Next Steps

Once everything is running:

1. Check the README.md for feature descriptions
2. Review docs/DATABASE_SCHEMA.md for database details
3. Start building API endpoints in server/routes/
4. Create React components in client/src/components/

---

## Getting Help

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Express.js Documentation: https://expressjs.com/
- React Documentation: https://react.dev/
- Node.js Documentation: https://nodejs.org/docs/

For project-specific issues, check the main README.md file.
