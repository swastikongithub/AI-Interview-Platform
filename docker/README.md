# Docker & Container Orchestration

This directory contains container definitions and orchestration scripts for the Antigravity AI Interview Platform.

---

## 1. Single-Command Local Development Startup (Recommended)

Local development uses the official **Supabase CLI Local Dev Stack** (`npx supabase start`) for PostgreSQL, GoTrue auth, PostgREST, Studio, and Kong, alongside Docker Compose for the Frontend, Backend API, and Redis.

To launch the full zero-to-running local stack with a single command:

### Windows (PowerShell)
```powershell
.\scripts\dev.ps1
```

### Linux / macOS (Bash)
```bash
./scripts/dev.sh
```

---

## 2. Manual Startup Commands

If you prefer starting services separately:

1. Start the local Supabase stack (creates Postgres + Auth + Studio + Kong containers):
   ```bash
   npx supabase start
   ```
2. Start the Frontend, Backend, and Redis containers:
   ```bash
   docker compose -f docker/docker-compose.yml up --build -d
   ```

---

## 3. Exposed Services & Ports

| Service | Local URL / Endpoint | Description |
| :--- | :--- | :--- |
| **Frontend Web Portal** | `http://localhost:3000` | React + Vite UI |
| **Backend Express API** | `http://localhost:4000` | REST API + BullMQ Worker |
| **Swagger API Docs** | `http://localhost:4000/api/docs` | OpenAPI 3.0 Documentation |
| **Supabase Studio** | `http://127.0.0.1:54323` | Local Admin Dashboard |
| **Supabase API (Kong)** | `http://127.0.0.1:54321` | API Gateway / PostgREST / Auth |
| **PostgreSQL DB** | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Local PostgreSQL 17 DB |
| **Redis Cache** | `redis://localhost:6379` | BullMQ & Caching |

---

## 4. Environment Variables & `SUPABASE_ENV`

The backend separates runtime environment (`NODE_ENV`) from database/auth backend target (`SUPABASE_ENV`):
- `NODE_ENV`: Governs app behavior (`development`, `production`, logging verbosity, Swagger gating).
- `SUPABASE_ENV`: Governs database target (`local` or `cloud`).
  - When `SUPABASE_ENV=local`, the backend connects to the local Supabase CLI instance (`http://localhost:54321` or `http://host.docker.internal:54321`) using deterministic local dev keys.
  - When `SUPABASE_ENV=cloud`, the backend loads `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` from the cloud project.
