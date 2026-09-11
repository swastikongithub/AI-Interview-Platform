# AI Interview Platform - Project Context

## 1. Project Overview
The AI Interview Platform is an autonomous technical hiring platform. It supports candidates, recruiters, interviewers, and admins in facilitating technical interviews, AI analysis of resumes, and coding challenges.

## 2. Verified Technology Stack
**Frontend:**
- React 18, TypeScript, Vite
- Tailwind CSS
- React Router DOM
- TanStack Query
- Supabase client (`@supabase/supabase-js`)
- lucide-react

**Backend:**
- Node.js, Express, TypeScript
- Zod 
- Supabase Admin SDK (`@supabase/supabase-js`)
- BullMQ, ioredis (for background jobs)
- Multer, pdf-parse (for resume upload/parsing)
- @google/genai (Google Gemini AI 1.5/2.5)
- Vitest, Supertest

## 3. Repository Structure
- `apps/frontend`: React client application
- `apps/backend`: Express server backend
- `packages/shared`: Shared types and logic across apps
- `supabase/`: Database migrations, seed data, and configuration
- `docs/`: Reference templates, system architecture, and ER diagrams
- `docker/`, `scripts/`: Infrastructure, local environment setup, and automation

## 4. Frontend Architecture
A Single Page Application (SPA) cleanly structured by roles. State management is handled by TanStack Query for async data and React Context (`AuthContext`) for session management. Styling uses Tailwind utility classes and some custom layer abstractions in `index.css`.

## 5. Backend Architecture
A REST API using Express. Modularly separated into routes, controllers/services, and middleware (e.g., rate limiting, request ID). Background processing and asynchronous workflows are handled by BullMQ and Redis (e.g., the Resume parsing queue).

## 6. Authentication Architecture
Managed via Supabase Auth. The frontend securely manages and passes a user JWT. The backend applies Row Level Security (RLS) on the DB directly for authenticated queries or uses the Service Role Key for elevated backend operations.

## 7. Authorization Model
A Role-Based Access Control (RBAC) system categorizing users as Candidate, Recruiter, Interviewer, or Admin. The frontend routes are protected using a `RoleGuard` wrapper component.

## 8. Role Matrix
- **Candidate:** Manages profile, uploads resume (for ATS analysis), takes practice/mock interviews, views job recommendations.
- **Recruiter:** Dashboard for managing job postings and reviewing candidates.
- **Interviewer:** Dashboard for evaluating candidates and conducting technical interviews.
- **Admin:** System administration capabilities.

## 9. Frontend Route Map
- `/login`: Public authentication page
- `/candidate/dashboard`: Portal overview for candidates
- `/candidate/profile`: Profile management & resume upload
- `/recruiter/dashboard`: Portal for recruiters
- `/interviewer/dashboard`: Portal for interviewers
- `/admin/dashboard`: Portal for administrators
- `/dev/components`: Component playground (development only)

## 10. Major Page Inventory
- **Candidate Dashboard:** Displays welcome banner, profile completeness widget, ATS score preview, mock interview status, and upcoming activities.
- **Candidate Profile:** Form for basic information, skills, education, and experience. Contains `ResumeUploader` and `JobRecommendations`.
- **Recruiter Dashboard:** Overview for jobs and candidates.
- **Interviewer Dashboard:** Upcoming interviews and feedback status.
- **Admin Dashboard:** Platform administration tasks.

## 11. API/Data Dependencies per Page
- **Candidate Profile/Dashboard:** 
  - `apiService.updateMyProfile` (PUT/PATCH `/api/v1/profiles`)
  - Resume upload endpoint (`/api/v1/resume`)
  - Auth context (`refreshProfile`)

## 12. Existing Reusable Components
- `Layout` and `RoleGuard` (structural)
- `ResumeUploader` and `JobRecommendations` (feature-specific)
- `Toast` / `ToastProvider` (feedback)
- Several unextracted UI fragments within pages (e.g., glass cards, skill tags).

## 13. Existing Visual System Summary
The current UI system features an inconsistent mix of light body backgrounds (`#f7f7f5`) paired with dark cards (`bg-surface-elevated` which maps to `#18181b`) and light text (`text-white`). It defines static `glass-card` classes with global orange/brown accents (`#a95a20`). The layout feels rigid, and the typography (Inter/Outfit) is not leveraged for premium hierarchy.

## 14. Reference-Material Inventory
Located in `docs/`:
- `Creatie® – Creative Designer Portfolio.html`
- `Neiden® — Design Studio & Explorations.html`
- `Saazai - Free AI SaaS Template.html`
- `Salonix - Hair & Beauty Salon Framer Template.html`
- `Sentira — AI Automation Agency Framer Website Template.html`

## 15. Reference-Derived Design Observations
- **Visual Hierarchy:** High-contrast sections, clear distinctions between content blocks, and frequent use of Bento-box grid layouts.
- **Typography:** Premium modern sans-serifs (Mona Sans, Geist, Plus Jakarta Sans) utilizing confident sizes, varied font weights, and tight tracking for headings.
- **Whitespace:** Generous padding and wide margins that let content breathe and establish rhythm.
- **Interaction/Motion:** Smooth scrolling mechanics (`lenis`), subtle depth through shadows and borders, glassmorphism applied deliberately rather than universally.

## 16. Product Flows
- **Candidate:** Logs in -> Lands on Dashboard -> Completes Profile Information -> Uploads Resume -> Views ATS match score -> Reviews Job Recommendations.

## 17. Functional Contracts that MUST remain unchanged
- API routes, payloads, and endpoint signatures (`/api/v1/...`).
- Supabase Auth logic, session persistence, and RLS policies.
- Background queue job configurations (e.g., user-scoped BullMQ job IDs).
- React Router path structures and `RoleGuard` protection limits.
- State management schemas (TanStack Query hooks/mutations).

## 18. Visual systems that will be completely replaced
- Current Tailwind color tokens and theme extensions in `tailwind.config.js`.
- `index.css` custom classes (e.g., `.glass-card`, `.glass-card-hover`).
- Hardcoded layout structures and decorative elements in pages like `CandidateDashboard.tsx` and `ProfilePage.tsx`.
- The current typography scale and generic spacing tokens.

## 19. Current responsive/accessibility observations
Basic responsive layout classes (e.g., `md:grid-cols-3`) are implemented, but sophisticated adaptive components are missing. Accessibility features like robust keyboard navigation and high-contrast focus states are not thoroughly applied.

## 20. Current motion/animation observations
Relies entirely on basic CSS transitions (`transition-all`, `duration-300`) and simple utility animations (`animate-in fade-in`). There is no choreographed motion or scroll-linked animation. The frontend currently lacks a robust animation library.

## 21. Known limitations/technical constraints
- Visual inconsistency between root styles and component styles.
- Lacking a robust library (`motion/react`) necessary to achieve the high-fidelity interactions seen in the reference materials.

## 22. Recommended redesign sequencing
1. **Foundation:** Integrate `motion/react`, establish the new design system tokens (colors, typography, spacing) in `tailwind.config.js` and `index.css`.
2. **Component Library:** Build base reusable UI primitives (Buttons, Cards, Inputs, Dialogs) adhering to the new visual language.
3. **Choreography:** Implement layout wrappers and global navigation elements with coordinated entry/exit animations.
4. **Page Overhauls:** Incrementally redesign major pages (beginning with Candidate Dashboard and ProfilePage) to match the new Framer-inspired aesthetics, ensuring all functional contracts are perfectly preserved.
