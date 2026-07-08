# GoDemy Project Analysis

Date: 2026-07-08

Scope: read-only repository analysis using the `analyze-project` skill, adapted from its deep-learning default framing to this Go/Next.js product repository.

## Executive Summary

GoDemy is already a working MVP-shaped learning platform: a Go/Gin backend, Next.js frontend, Postgres persistence, Redis-backed rate limiting, admin CRUD, progress tracking, certificates, and an in-browser Go runner. The current product direction broadly matches the attached MVP model: free onboarding/course/trainer, paid Junior bootcamp access, and certificate surfaces.

The main gap is not basic architecture; it is product-contract precision. The attached model says certificates should represent paid-level completion plus required projects/checkpoints. The code currently derives certificate eligibility mostly from completed lessons/exercises, with Pro required for download/email. That is a reasonable first mechanism, but it does not yet model mandatory projects, GitHub evidence, final tests, or subscription periods as first-class entities.

## Product Model Fit

Attached MVP model:

- Free: beginner Go course, free trainer, progress, first projects.
- Pro Subscription: all courses/bootcamp levels, expanded practice, final projects, certificates after conditions.
- Certificate: result-based, not just view-based.

Current implementation:

- Free course and trainer exist as public content APIs and frontend routes.
- Pro/paid path exists via `isPremium`, `/bootcamp/buy`, `/junior`, and admin user activation.
- Certificates exist for `course`, `trainer`, and `bootcamp`, computed from user progress.
- Payment is not integrated; the buy page is currently Telegram/manual activation.

Product mismatches to resolve before the MVP feels coherent:

- The product document names free projects as CLI calculator, console todo, mini REST API; the home page currently advertises Guess Number, Weather Service, Expense Tracker.
- Certificate logic uses completed lessons/exercises, not required project submissions/checkpoints/GitHub links.
- The attached MVP says the certificate is only after paid-level completion; the app also has course/trainer certificates, though Pro is required for download/email.
- Go Junior/Middle/Senior are presented in copy, but only Junior has a concrete gated route.

## Architecture Map

Backend:

- Entry point: `backend/main.go`
- Framework: Gin
- Persistence: GORM + Postgres
- Cache/rate-limit: Redis
- Config: `backend/config/config.go`
- Domain models: `backend/models/models.go`
- Repositories: `backend/repository/*`
- Use cases: `backend/usecase/*`
- HTTP handlers: `backend/delivery/http/*`
- Middleware: `backend/middleware/*`
- Code execution sandbox: `backend/sandbox/runner.go`
- Seed content: `backend/data/seed.go`, `backend/data/flagship_course.go`, `backend/data/bank_internship_course.go`

Frontend:

- App router entry: `frontend/src/app/*`
- API client: `frontend/src/lib/api.ts`
- Auth/progress store: `frontend/src/lib/store.ts`
- Main public routes: `/`, `/guide`, `/trainer`, `/bootcamp`, `/bootcamp/buy`
- Paid route family: `/junior/*`
- Profile/certificates: `/profile`, `/certificates`, `/certificate`
- Admin routes: `/admin/*`

Deployment:

- Local/prod orchestration: `docker-compose.yml`, `docker-compose.prod.yml`
- Backend and frontend Dockerfiles exist.
- Nginx configs exist under root and `docker/nginx`.

## Key Flows

Registration/login:

- `POST /api/auth/register`
- `POST /api/auth/login`
- JWT-based auth via `middleware.AuthRequired`
- Email verification/password reset scaffolding exists.

Content:

- Public lesson/exercise endpoints: `GET /api/lessons`, `GET /api/lessons/:slug`, `GET /api/exercises`, `GET /api/exercises/:id`
- Public trainer topic endpoints: `GET /api/trainer/topics`, `GET /api/trainer/topics/:slug`

Progress:

- Protected endpoints: `GET /api/progress`, `POST /api/progress`
- Progress entity types: `lesson`, `exercise`, `exercise_tasks`

Paid access:

- Frontend route guard for `/junior/*` checks `user.isPremium || user.isAdmin`.
- Admin can activate premium via `POST /api/admin/activate` and edit users.

Certificates:

- Built in `backend/delivery/http/profile.go`.
- Current certificates: course, trainer, bootcamp.
- Eligibility is derived from completed lesson/exercise IDs.
- Full name is required for preview; premium is required for download/email.

Runner:

- `/api/run` executes arbitrary Go code.
- `/api/submit` can run tests attached to an exercise and save progress on pass.
- Docker sandbox mode exists when `SANDBOX_MODE=docker`; otherwise execution is local process-based.

## Conservative Insertion Points

For the attached MVP model, likely insertion points are:

- Subscription/payment state: extend `models.User` or add `Subscription`/`PaymentEvent` models, then wire through `auth`, admin user management, and `/bootcamp/buy`.
- Project requirements: add `Project`, `ProjectSubmission`, and/or `Checkpoint` models rather than overloading `Progress.Payload`.
- Certificate rules: replace hard-coded `buildCertificates` rules with a declarative requirement layer that can combine lessons, exercises, projects, tests, GitHub URLs, and active subscription.
- Access control: backend-side access policy should sit in handlers/usecases for paid modules, not only in frontend layouts.
- Course taxonomy: decide whether `Level/Module/Topic` is the source of truth or whether string fields on `Lesson`/`Exercise` remain primary. Right now both concepts coexist.

## Testing/Verification Observed

I did not run heavy jobs. This was a static/read-only analysis plus lightweight file inspection.

Existing tests found:

- `backend/config/config_test.go`
- `backend/sandbox/runner_test.go`
- `backend/data/bank_internship_course_test.go`

High-value next tests:

- Backend tests for premium gating on bootcamp content and bootcamp submissions.
- Certificate rule tests for course/trainer/bootcamp eligibility.
- API contract tests for `NEXT_PUBLIC_BACKEND_URL` fallback behavior.
- Runner tests for Docker sandbox mode and local fallback behavior.

## Notes On Skill References

The skill references `../../references/agent-operating-principles.md` and `references/research-pitfall-checklist.md`, but those files were not present under `/Users/iskander/.codex` during this run. `references/analysis-policy.md` was available and used.
