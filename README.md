# IBO Suite — Integrated Business Operations

A comprehensive full-stack application for managing finance, sales, purchasing, inventory, CRM, and analytics.

## Quick Start

### Prerequisites
- Node.js 20+
- Access to existing SQL Server database (see DB_CONNECTION_SPEC.md)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT_SECRET
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
cp backend/.env.example backend/.env
# Edit with real values
docker-compose -f deployment/docker-compose.yml up
```

## Architecture
- **Backend:** Node.js 20, TypeScript, Express, JWT auth, bcrypt
- **Frontend:** React 19, TypeScript, Vite, Zustand, TanStack Query
- **Database:** SQL Server (DB-Preserve: stored procedures only, no schema changes)

## Build Phases
See `docs/PROJECT_PHASE_PROGRESS.md` for current build status.
