# COMPLETE UI/UX REDESIGN — MASTER CLAUDE SPECIFICATION

## 0. Mission

This file is the single source of truth for the complete redesign of the AI Interview Platform.

This is a **full UI/UX replacement**, not a restyle.

The new interface must not visually inherit the previous design. Do not simply recolor existing pages, add animation to old cards, or preserve the old dashboard composition. Rebuild the visual hierarchy, navigation, layouts, interactions, responsive behavior, states, forms, motion, and component composition from first principles.

Preserve the existing product functionality, API contracts, authentication, authorization, database, security model, and technical stack unless a change is genuinely required to support the redesign.

The final product should feel like a completely different application built on the same reliable backend.

---

## 1. Mandatory Animate Skill

The repository already contains the downloaded animation skill under:

`.agents/skills/animate/`

Expected files:
- `.agents/skills/animate/SKILL.md`
- `.agents/skills/animate/RECIPES.md`

The skill was obtained with:

```bash
npx skills add emilkowalski/skills@animate
```

This command is included for reference. **Do not reinstall it if the local files are already present.**

Before writing UI code, Claude MUST:
1. Read `SKILL.md`.
2. Read `RECIPES.md`.
3. Follow their recommended animation patterns throughout the redesign.

Do not assume the contents of the skill from memory.

Animation is a required product capability, not an optional polish step.

---

## 2. Do Not Preserve the Previous Design

The old interface must not remain recognizable.

Do not preserve:
- old dashboard layouts
- old card grids
- old navbar composition
- old page shells
- old typography hierarchy
- old token names purely for convenience
- old decorative treatment
- old spacing patterns
- old visual terminology
- old component styling
- old shadow/radius language
- old empty/error/loading presentation

It is acceptable to retain a component's **functional behavior** while completely replacing its visual structure.

Create a new visual language from scratch.

---

## 3. Product Character

The redesigned product should feel:

- premium
- intelligent
- focused
- modern
- confident
- highly intentional
- responsive
- sophisticated
- memorable
- suitable for serious recruiting and interviewing

Avoid generic:
- AI SaaS dashboard aesthetics
- admin-template appearance
- excessive rounded cards
- glassmorphism
- neon gradients
- fake analytics
- decorative metric spam
- visual noise
- generic component-library layouts

Do not design for visual novelty at the expense of usability.

---

## 4. Existing Technical Stack — KEEP IT

Frontend:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- TanStack Query
- Axios
- Supabase JS
- Lucide React
- Motion for React (`motion/react`)

Backend:
- Node.js
- Express
- TypeScript
- Zod
- Supabase Admin SDK
- BullMQ
- Redis / ioredis
- Multer
- pdf-parse
- Google Gemini via `@google/genai`

Infrastructure:
- Supabase PostgreSQL
- Supabase Auth
- PostgreSQL RLS
- Redis
- BullMQ

Do not migrate frameworks simply to accomplish the visual redesign.

---

## 5. Preserve Real Functionality and Security

The redesign must preserve:

- email/password authentication
- Google OAuth
- Apple OAuth
- logout
- role guards
- candidate/recruiter/interviewer/admin access boundaries
- Supabase sessions
- existing API services
- TanStack Query
- RLS
- interview domain
- session persistence
- evaluation visibility
- resume features
- ATS features
- job recommendations
- recruiter features
- interviewer features
- admin features
- all real error/loading states

Never weaken security to make a UI flow easier.

Never trust a client-controlled role.

Never move authorization exclusively to the frontend.

Never expose Supabase service-role credentials.

---

## 6. Mandatory Repository Audit Before Coding

Before redesigning anything, inspect:

- route structure
- every current page
- shared layout
- navigation
- Tailwind configuration
- existing design tokens
- existing motion files
- shared buttons/inputs/forms
- modals/drawers
- tables/lists
- auth context
- role guards
- API client
- candidate pages
- recruiter pages
- interviewer pages
- admin pages
- interview pages
- responsive behavior

Classify existing code as:
1. functional primitive worth retaining
2. refactor candidate
3. visually obsolete and replace
4. duplicated and consolidate

Do not keep old visual components simply because they already exist.

---

## 7. New Design System From Zero

Build a coherent new semantic token system for:

- page/surface backgrounds
- elevated surfaces
- primary/secondary text
- muted text
- borders
- accent colors
- success/warning/error states
- focus states
- typography
- spacing
- radii
- shadows
- interaction states
- motion durations
- easing
- breakpoints

Do not maintain two competing design systems.

Search for and remove obsolete visual tokens when safe.

---

## 8. Typography

Use a distinctive display typeface paired with a highly readable interface typeface.

Use monospace selectively for:
- metadata
- technical values
- timestamps
- status labels
- IDs
- code-related content

Typography must establish hierarchy for:
- page titles
- section titles
- body/supporting text
- labels
- actions
- metadata
- data values
- status/state

Do not use typography only as decoration.

---

## 9. Layout

Do not turn every surface into a grid of cards.

Use the appropriate composition for each workflow:
- asymmetric layouts
- editorial splits
- full-width sections
- dense data surfaces
- focused task workspaces
- sticky context panels
- structured lists
- progressive disclosure
- compact control bands
- full-screen interview experiences

Candidate interview screens should be focused and immersive.

Recruiter screens should be information-efficient.

Interviewer screens should prioritize reading, assessment, and decision-making.

Admin can be dense, but must not look like a legacy admin template.

---

## 10. Navigation

Redesign navigation from first principles.

Requirements:
- obvious current location
- strong hierarchy
- role-aware destinations
- clear active state
- responsive mobile navigation
- keyboard accessibility
- clear logout/account access
- sensible information architecture

Do not merely restyle the current navbar.

Reconsider its grouping, labels, hierarchy, mobile composition, and active-state behavior.

---

## 11. Motion Is a First-Class System

The product must have meaningful motion across the redesigned experience.

The goal is NOT a few generic fade-ins.

Use motion to communicate:
- hierarchy
- navigation
- focus
- continuity
- causality
- progress
- state changes
- feedback
- transition

Use the local Animate skill to implement motion patterns.

Build reusable motion primitives where appropriate rather than duplicating animation logic page by page.

Useful patterns may include:
- page transitions
- staggered reveals
- masked text
- section reveals
- layout transitions
- list insert/remove
- modal/drawer motion
- disclosure/accordion
- state transitions
- hover/focus micro-interaction
- progress transitions
- scroll-linked storytelling where justified
- sticky/pinned storytelling where justified

---

## 12. Motion Performance and Accessibility

Follow these rules:

- Prefer transform/opacity for high-frequency motion.
- Avoid React state updates on every scroll frame.
- Use MotionValues for continuous values.
- Do not animate from polling/refetch loops.
- Avoid layout thrashing.
- Avoid excessive simultaneous animation.
- Respect device capability.
- Support `prefers-reduced-motion`.
- Remove/reduce parallax and large movement under reduced motion.
- Preserve usability when animation is disabled.
- Do not sacrifice accessibility for motion.

Do not recreate the previously fixed remount bug: motion wrappers must retain stable component identity across input state updates.

---

## 13. Candidate Experience

Rebuild candidate pages as a coherent product journey, not a card collection.

Candidate areas:
- authentication
- dashboard
- profile
- resume
- ATS
- recommendations
- interviews
- active interview
- evaluation
- application activity

Every page should make the next meaningful action obvious.

Do not fabricate metrics.

---

## 14. Interview Experience

Make the interview experience one of the strongest parts of the new product.

Text MVP flow:
1. preparation
2. interview brief
3. session start
4. question
5. response
6. submission feedback
7. progress
8. completion
9. evaluation availability

The interview must not feel like a generic form wizard.

The active session should minimize distractions.

Question transitions should be deliberate and responsive.

Refresh must preserve state through the backend.

Do not invent evaluation results.

---

## 15. Recruiter Experience

Redesign from scratch around:
- job management
- candidate pipeline
- interview coordination
- candidate review
- communication
- decision-making
- real analytics only

Use tables, lists, or kanban structures only where they materially improve the workflow.

Do not turn every recruiter page into cards.

---

## 16. Interviewer Experience

Prioritize:
- assigned interviews
- candidate context
- interview questions
- candidate responses
- assessment
- evaluation
- decision-making

The evaluation surface should feel like a serious assessment workspace.

It must clearly support:
- reading the question
- reading the candidate response
- scoring criteria
- structured feedback
- save/update
- completion state

---

## 17. Admin Experience

Redesign admin around:
- platform/system health
- user and role oversight
- operational state
- administration

Dense is acceptable when useful, but legacy admin aesthetics are not.

---

## 18. Forms

Redesign all forms with:
- clear labels
- visible focus
- strong errors
- useful helper text
- accessible keyboard flow
- responsive layouts
- submission feedback
- disabled/loading states

Do not communicate errors by color alone.

Do not allow inputs to remount or lose focus during typing.

---

## 19. Loading / Empty / Error States

Design these intentionally.

Avoid spinner-only screens and giant generic error blocks.

Provide meaningful states for:
- loading
- empty
- success
- validation error
- forbidden
- not found
- network failure
- pending AI work
- completed AI work

---

## 20. Accessibility

Every redesigned surface must support:

- semantic HTML
- keyboard navigation
- visible focus
- accessible labels
- correct link/button semantics
- sensible ARIA
- focus traps for dialogs
- Escape handling
- sufficient contrast
- reduced motion
- touch-friendly mobile behavior

---

## 21. Responsive Design

Do not simply shrink desktop.

Design deliberate mobile compositions for:
- navigation
- dashboard
- interview list
- interview session
- evaluation
- forms
- recruiter workflows
- interviewer workflows
- admin workflows

Prevent unnecessary horizontal scrolling.

---

## 22. Component Strategy

Use reusable components deliberately.

Centralize:
- buttons
- inputs
- typography
- navigation
- status indicators
- dialogs
- drawers
- lists
- tables
- motion

Refactor functional primitives where useful, but do not create duplicate component families.

The new component API should support the new design rather than forcing the new design to imitate the old component API.

---

## 23. Real Data Only

Never invent:
- scores
- analytics
- AI confidence values
- candidate metrics
- recruiter metrics
- evaluations
- AI summaries
- system health values
- interview results

Use real API data.

When data does not exist, design an honest empty/pending state.

Do not turn future features into fake UI.

---

## 24. Existing Interview MVP Must Remain Functional

Preserve the real interview backend:

- interviews
- interview questions
- interview sessions
- responses
- evaluations

Preserve:
- practice interview creation
- ready state
- session creation
- text responses
- response persistence
- browser refresh recovery
- explicit completion
- evaluation pending/completed states

The new UI must connect to the real APIs.

Do not replace functional flows with static mockups.

---

## 25. OAuth Must Remain Functional

Preserve:
- email/password
- Google
- Apple
- loading states
- redirect behavior
- Supabase session handling
- candidate role initialization

Do not introduce another auth system.

---

## 26. Responsive + Role-Aware Navigation

The new navigation must support candidate, recruiter, interviewer, and admin contexts without exposing unauthorized routes.

Frontend visibility is UX; backend authorization remains the authority.

---

## 27. Implementation Order

1. Read this entire specification.
2. Read `.agents/skills/animate/SKILL.md`.
3. Read `.agents/skills/animate/RECIPES.md`.
4. Audit the current app and document the legacy visual system.
5. Build the new design foundation.
6. Replace the application shell/navigation.
7. Redesign authentication.
8. Redesign candidate experience.
9. Redesign interview session/evaluation.
10. Redesign interviewer experience.
11. Redesign recruiter experience.
12. Redesign admin experience.
13. Unify motion/responsive/accessibility patterns.
14. Remove obsolete visual dependencies.
15. Browser-test all real flows.
16. Run build/typecheck.
17. Fix all issues discovered during verification.
18. Deliver a final report.

Proceed autonomously through ordinary design decisions covered by this document.

---

## 28. Zero Legacy Visual Dependency

Before completion, search for and remove obsolete:
- color tokens
- typography tokens
- old navbar styles
- old card layouts
- old dashboard structures
- stale motion wrappers
- duplicate visual components
- old visual terminology
- unused decorative assets

Do not leave the old design silently active underneath the new one.

---

## 29. No Parallel Application

Modify the actual existing application.

Do not:
- create another frontend
- create another router
- build a demo-only redesign
- create duplicate pages under a second namespace
- build a separate design sandbox instead of the real routes

---

## 30. Visual Quality Gate

Every page must answer yes to:

- Is the hierarchy immediately clear?
- Is the primary action obvious?
- Is the composition intentional?
- Does typography carry real hierarchy?
- Does motion communicate state or continuity?
- Does the page feel unique?
- Does mobile feel designed, not compressed?
- Are empty/error/loading states polished?
- Is there any obvious visual residue from the old interface?
- Does the interface remain believable without decorative filler?

If not, keep iterating.

---

## 31. Browser Verification

Verify every major redesigned route in a real browser at:
- desktop
- tablet-ish width
- mobile width

Also test:
- keyboard navigation
- reduced motion
- loading
- empty
- error
- unauthorized
- route transitions
- refresh persistence
- real authentication
- real interview flow

Do not declare success solely from build output.

---

## 32. Quality Gates

Before final completion:

- frontend TypeScript passes
- backend type checking remains healthy
- production build passes
- no new console errors
- no broken routes
- no obvious accessibility regressions
- auth works
- OAuth surfaces remain correct
- role restrictions remain correct
- real APIs continue working
- interview MVP still works end-to-end

---

## 33. Change Management

Do not commit unless explicitly requested.

Avoid unrelated backend refactors.

If a backend change is genuinely required for a redesigned flow, document:
- reason
- changed API contract
- security implications
- tests

---

## 34. Final Deliverable

The final product must be visibly and experientially different from the old UI.

A reviewer familiar with the old product should NOT describe the result as:
- old dashboard with new colors
- old UI plus animations
- old template with new fonts

The correct outcome is:

**A completely redesigned AI Interview Platform with a new visual identity, new interaction language, strong animation, better information hierarchy, intentional responsive UX, and preserved real functionality/security.**

---

## 35. Final Directive to Claude

Treat this file as the standing contract.

Do not ask for these requirements again.

Do not preserve the old visual system because it is convenient.

Do not under-deliver the redesign.

Do not stop after a few pages.

Do not build a superficial theme replacement.

Use the local Animate skill on the real application.

Preserve the product's actual backend and security architecture.

Finish the complete redesign and verify it in-browser.

**Complete UI/UX replacement is the objective.**
