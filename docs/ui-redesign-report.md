# UI/UX Redesign — Implementation Report

Companion to `docs/COMPLETE_UI_UX_REDESIGN_CLAUDE.md`. Records the legacy audit, the new system, backend changes, verification and known gaps.

## 1. Legacy audit (before)

| Area | Legacy state | Classification | Outcome |
| --- | --- | --- | --- |
| Tokens | Warm "paper/ink/bronze" palette, `Newsreader` / `Hanken Grotesk` / `JetBrains Mono`, `headline-*` sizes, `space-*` spacing | Visually obsolete | Replaced |
| `styles/theme.ts` | Pill/card class strings, `slate-*` leftovers | Obsolete + duplicated | Deleted |
| `components/common/*` (Button, Input, Textarea, Badge, Modal, Toast, Tooltip, Score, LightCard, SpotlightCard, SectionHeader, SkeletonLoader, EmptyState) | Two competing card families, modal without focus trap, toasts without motion | Refactor / replace | Replaced by `components/ui/*` |
| `components/layout/Navbar` + `Layout` | Three-column top navbar; demo role switcher; marketing footer claiming "RLS Active" | Visually obsolete | Replaced by `components/shell/AppShell` |
| `motion/*` (Reveal, MaskedTextReveal, Parallax, StickyStory, ImageReveal, ScrollProgress, SectionTransition, PageTransition) | Long 500–800ms reveals on functional UI, parallax on dashboards, `ease` curves not from the skill | Stale motion wrappers | Replaced by `motion/tokens`, `TextReveal`, `RouteTransition`, CSS primitives |
| Login | Marketing scroll story with Unsplash images | Obsolete | Rebuilt as split sign-in |
| Candidate dashboard | **Fabricated ATS score** (`ats_score || 85`), static "no schedules" block | Fake data | Rebuilt around a real next step |
| Recruiter / interviewer dashboards | **Hard-coded zero metrics**, `alert()` "Post job" | Fake UI | Rebuilt on real interview data |
| Admin dashboard | **Invented health values** ("14 schema tables", "All Systems Nominal") | Fake data | Rebuilt on `/health` + real interview counts |
| Interview "Resume session" | Called start RPC, which rejects non-`ready` interviews | Functional bug | Fixed via session lookup |
| `pages/dev/ComponentPlayground` | Showcase of the deleted component family | Obsolete sandbox | Deleted |
| AuthContext, RoleGuard logic, `services/api.ts`, Supabase client, TanStack Query | Sound | Functional primitive | Retained (RoleGuard visuals rebuilt) |

## 2. New system

- **Tokens** (`src/index.css`, `tailwind.config.js`): semantic RGB custom properties (`canvas`, `surface`, `fg`, `edge`, `signal`, status tones). `.theme-night` re-declares them for dark, focused surfaces (navigation rail, interview session, next-step bands, toasts). Contrast verified by `apps/frontend/contrast.js` (all pairs ≥ 4.5:1).
- **Type**: Bricolage Grotesque (display), Geist (interface), Geist Mono (metadata, IDs, counts).
- **Components** (`src/components/ui`): Button/ButtonLink/IconButton, TextField/TextAreaField/SelectField, StatusBadge/StatusDot (icon + label, never color alone), Dialog/ConfirmDialog (focus trap, Escape, focus restore, scroll lock), Toast, Segmented (radiogroup, arrow keys), StateBlock/ErrorState/Skeleton, PageHeader/Section/Surface, Meter.
- **Shell** (`src/components/shell`): fixed role-aware dark rail ≥1024px; top bar + focus-trapped drawer below. `aria-current`, skip link, scroll reset on navigation.
- **Motion** — per `.agents/skills/animate`: strong ease-out / ease-in-out / drawer curves only; transform/opacity (and clip-path via a single MotionValue); press `scale(0.97)` 160ms; route entrance 220ms CSS; stagger 40ms steps; modal 250ms `scale(0.96)`; drawer 400ms; toast 400ms `ease` from the bottom; layout-id nav marker and segmented pill; masked question reveals; progress `scaleX`. `MotionConfig reducedMotion="user"` + CSS `prefers-reduced-motion` fallbacks (fade only, no movement).

## 3. Routes

Existing routes preserved. Added (same router, same guards): `/candidate/resume`, `/candidate/jobs`, `/recruiter/interviews/:id`, `/interviewer/interviews/:id`, and an in-shell not-found page. `/` now redirects to the signed-in role's workspace. The interview session renders outside the shell (immersive). `/dev/components` removed.

## 4. Backend changes

### 4.1 `GET /api/v1/interviews/:id/sessions` (new, read-only)
- **Reason**: the UI could not find an interview's open session (resume after leaving was broken) and reviewers had no way to reach responses.
- **Contract**: `200 InterviewSession[]` newest first; `404` if the interview doesn't exist or isn't visible to the caller; `401` unauthenticated.
- **Security**: identical scoping to `GET /:id` — candidates only their own, interviewers only assigned, recruiters/admins all. Session IDs are therefore only discoverable by parties who can already see the interview.
- **Tests**: `tests/interviews.test.ts` #17, #18.

### 4.2 Assignment no longer rewinds lifecycle
- **Reason**: `PATCH /:id/assign` forced `status = 'ready'`, so assigning an interviewer to a finished interview reverted it to "ready".
- **Contract**: unchanged shape; status is promoted `draft → ready` only.
- **Security**: none (authorization unchanged).
- **Tests**: #19; existing #4, #5, #12, #16 still pass.

### 4.3 Migration `0005_evaluation_feedback_fields.sql`
- **Reason**: the API's Zod schema and `Evaluation` type already accept `overall_score` and `summary` (and declare `strengths`/`weaknesses`), but the table lacked those columns — any evaluation save including them failed.
- **Contract**: no API change; the declared contract now works. Adds nullable `overall_score` (CHECK 0–100), `summary`, `strengths`, `weaknesses`.
- **Security**: additive; existing RLS policies on `evaluations` apply unchanged.
- **Tests**: #20.

## 5. Verification

- Frontend `tsc` and `vite build` pass; backend `tsc` passes.
- Backend: `interviews` (20/20), `auth`, `profile`, `rls`, `infra` pass. `resume_ats` had 5 failures caused by the live Gemini API returning `503 UNAVAILABLE` (external), not by these changes.
- Browser (real local Supabase + API): demo sign-in; refresh persistence; candidate create → brief → begin → answer → draft restored after reload → server-side resume after reload → finish (confirm dialog, keyboard) → pending results; recruiter pipeline + review; interviewer draft save → release; candidate sees released evaluation; profile edit/save/revert with input identity preserved while typing; admin health, validation, role change; forbidden page; not-found page; mobile drawer (focus, Escape, restore); 390px overflow checks on candidate pages, admin and recruiter pipeline.

## 6. Known gaps and follow-ups

- **Not browser-verified**: `prefers-reduced-motion` emulation (implemented in CSS + `MotionConfig`), recruiter review and interviewer workspace at 390px (use the same fixed grid pattern), Google/Apple OAuth round-trip (UI + `signInWithOAuth` call unchanged; providers not configured locally).
- **Rate limit**: `/api/v1` allows 100 requests / 15 min per IP. Normal browsing of data-rich pages reaches this quickly; consider a per-user limiter or a higher ceiling for authenticated reads.
- **Pre-existing security issues (not changed)**: `PATCH /:id/cancel` has no authorization check; `GET /:id/sessions/:sessionId` and its `/responses` don't verify the caller owns or is assigned to the interview. Profile URLs accept `javascript:` schemes server-side (the UI now renders only http(s) links).
- **Assignment by UUID**: there is no user directory endpoint, and `assign` doesn't verify the target has the interviewer role.
- **Bundle**: single ~800 kB chunk; route-level code splitting would help first load.
