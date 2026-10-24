# Edufyi HR Dashboard

Full-stack HR Management System built with React + Express + MongoDB.

## Structure

```
server.js          → Root entry point (run: node server.js)
app.js             → Alias entry point
package.json       → Dependencies & scripts
.env.example       → Environment variable template
.htaccess          → Apache reverse proxy config
dist/              → Built React frontend (SPA)
server/src/        → Express backend API
  ├── app.js       → Express app factory
  ├── server.js    → Server bootstrap
  ├── modules/     → Feature modules (auth, employees, leave, etc.)
  ├── middleware/   → Auth, error handling, sanitization
  ├── models/      → Mongoose models
  ├── routes/      → API routes
  └── db/          → Database connection
public/            → Static assets (policies, forms)
src/               → React source code (for development)
```

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and credentials

# Run backend only
npm start

# Run frontend dev server
npm run dev

# Run both together
npm run dev:all
```

## Deployment (Webuzo / Node.js Hosting)

1. Clone this repo on server
2. Run `npm install --omit=dev`
3. Copy `.env.example` to `.env` and configure
4. Start: `node server.js`

### Webuzo Settings
| Setting | Value |
|---|---|
| Port | `30006` |
| Start Command | `node server.js` |
| Startup File | `server.js` |
| Environment | Production |

## API Endpoints

- `GET /api/v1/health` — Health check
- `POST /api/v1/auth/login` — Login
- `GET /api/v1/employees` — List employees
- `GET /api/v1/leave` — Leave management
- `GET /api/v1/attendance` — Attendance tracking
- `GET /api/v1/payroll` — Payroll management

## Default Credentials

Set via environment variables:
- **Admin**: `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- **HR**: `HR_EMAIL` / `HR_PASSWORD`
