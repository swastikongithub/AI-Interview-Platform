# Antigravity AI Interview Platform

Next-generation autonomous technical hiring platform built with **React + TypeScript + Vite + Tailwind CSS + Node.js + Express + Supabase (Postgres, Auth, RLS) + Gemini AI**.

---

## Phase 0: Foundation — Working & Verified Increment

### What Was Built
1. **Supabase Database Schema & RLS Policies**:
   - Locked 14-table schema (`users`, `profiles`, `companies`, `jobs`, `applications`, `interviews`, `interview_questions`, `interview_answers`, `coding_problems`, `test_cases`, `submissions`, `feedback_reports`, `notifications`, `badges`, and `xp_log`) in `supabase/migrations/0001_initial_schema.sql`.
   - Comprehensive **Row Level Security (RLS)** policies enabled across all tables, ensuring candidates only access their own data while recruiters/interviewers access scoped candidate profiles.
   - Seed script `supabase/seed.sql` with sample demo accounts for all 4 roles.

2. **Backend API (Node.js + Express + TypeScript)**:
   - Modular Express architecture in `backend/` with Zod schema input validation and `express-rate-limit` (Ground Rule #4).
   - Role-Based Access Control (RBAC) middleware (`authMiddleware`, `requireRole`).
   - Profile CRUD API (`GET /api/v1/profiles/me`, `PUT /api/v1/profiles/me`, `GET /api/v1/profiles/:userId`).
   - Supports both remote Supabase PostgreSQL and local dev/demo mock storage out of the box.

3. **Frontend Web App (React 18 + TypeScript + Vite + Tailwind CSS + React Router + TanStack Query)**:
   - Premium dark-mode glassmorphic interface with gradient typography and responsive layouts.
   - 4 Role-Appropriate Dashboards protected by `<RoleGuard />` components:
     - `/candidate/dashboard` (Candidate Portal)
     - `/recruiter/dashboard` (Recruiter Portal)
     - `/interviewer/dashboard` (Interviewer Console)
     - `/admin/dashboard` (Admin Console with RLS & security matrix)
   - Candidate Profile CRUD page (`/candidate/profile`) with interactive skills tag editor and structured education & experience forms.
   - **1-Click Demo Role Switcher** in the top navigation bar to test all 4 role experiences effortlessly.

---

## Running Locally & Testing Acceptance Criteria

### 1. Start Backend API Server
```powershell
cd backend
npm install
npm run dev
```
- The backend runs on **http://localhost:4000**.
- Run automated unit & integration tests:
  ```powershell
  npm test
  ```

### 2. Start Frontend Web App
```powershell
cd frontend
npm install
npm run dev
```
- Open **http://localhost:3000** in your browser.

---

## Verification & Acceptance Criteria (Phase 0)
- **4 Role Types & Route Guards**: Use the `Role: Candidate / Recruiter / Interviewer / Admin` dropdown in the navigation bar. Attempting to visit `/recruiter/dashboard` as a `Candidate` triggers the `<RoleGuard>` restriction dialog.
- **Candidate Profile CRUD**: Navigate to **My Profile**, add/remove technical skills, education institutions, and professional roles, then click **Save Profile Changes**.
- **RLS & Rate Limiting**: All backend routes enforce Zod validation and IP rate limiting (100 req/15m).
