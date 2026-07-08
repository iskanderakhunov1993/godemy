# GoDemy Risks

Date: 2026-07-08

Severity labels are pragmatic product/engineering priorities. Some items are marked as heuristics where I did not execute a full exploit or end-to-end reproduction.

## P0/P1

### P1: Paid bootcamp content appears backend-public

Evidence:

- `backend/main.go:123-127` registers lessons/exercises as public endpoints.
- `backend/main.go:129-131` registers trainer topics as public endpoints.
- `frontend/src/app/junior/layout.tsx:12-24` gates `/junior/*` in the browser.

Why it matters:

The MVP model depends on Pro gating for bootcamp-level content. A frontend guard improves UX, but it is not an access-control boundary. If bootcamp lessons/exercises are returned by public APIs with `module=bootcamp`, a non-premium user may fetch paid content directly.

Recommended direction:

Move paid-content authorization into backend handlers/usecases. Public APIs can keep free content public, but bootcamp/pro modules should require auth and `isPremium || isAdmin`.

### P1: Runner can execute locally unless Docker sandbox is explicitly enabled

Evidence:

- `backend/sandbox/runner.go:106-113` runs code directly with `exec.CommandContext` unless `SANDBOX_MODE=docker`.
- Docker isolation exists at `backend/sandbox/runner.go:116-160`.

Why it matters:

The app exposes `/api/run` for arbitrary user code. Local process execution is much riskier than Docker isolation. The Docker path has stronger boundaries: no network, CPU/memory/PID limits, read-only filesystem, dropped capabilities.

Recommended direction:

Treat Docker sandbox mode as required outside trusted local development. Add startup validation for production-like environments and document the required runner image.

## P2

### P2: Junior module naming is inconsistent between runner gating and current bootcamp content

Evidence:

- `backend/usecase/runner.go:33-45` only applies sequential unlock rules when `exercise.Module == "junior"`.
- Elsewhere the Junior bootcamp appears to use `module=bootcamp`, for example frontend calls in `/junior` routes and certificate bootcamp logic.

Why it matters:

If bootcamp exercises are stored with module `bootcamp`, the sequential unlock check for module `junior` will not run. This may be intentional legacy support, but it is suspicious and should be verified.

Recommended direction:

Choose one canonical module key for paid Junior content and align runner gating, frontend filters, certificate rules, seed data, and admin tools.

### P2: Certificate rules do not yet encode the final MVP certificate contract

Evidence:

- `backend/delivery/http/profile.go:172-263` builds certificate progress from completed lesson/exercise IDs.
- `backend/delivery/http/profile.go:280-283` marks a certificate earned from total progress, then gates download/email by premium.

Why it matters:

The attached MVP says certificates require active subscription, completed bootcamp level, mandatory projects, final test/checkpoint, GitHub projects, and final backend project completion. Current logic is useful, but it is mostly lesson/exercise completion and does not model project evidence.

Recommended direction:

Introduce explicit requirement records or a certificate rule engine before certificates become a trust-bearing user artifact.

### P2: Product copy and product model disagree on the three free projects

Evidence:

- Attached product model: CLI calculator, console todo, mini REST API.
- `frontend/src/app/page.tsx:8-30`: Guess Number, Weather Service, Expense Tracker.

Why it matters:

The first free path is the promise users will remember. Mismatched project names create confusion for landing pages, course content, certificates, and portfolio positioning.

Recommended direction:

Pick the three MVP projects and align landing copy, guide modules, trainer tasks, admin seed content, and certificate copy.

### P2: Subscription is manual/admin-driven, not a payment system

Evidence:

- `frontend/src/app/bootcamp/buy/page.tsx:94-105` says online payment is being connected and routes to Telegram.
- Admin/user fields contain `isPremium` and `premiumUntil`, but no payment/subscription ledger was observed.

Why it matters:

This is acceptable for early validation, but it limits self-serve conversion, refunds, subscription expiry, auditability, and certificate eligibility based on active subscription.

Recommended direction:

Before scaling paid users, add a subscription/payment event source of truth and make `isPremium` a derived or synchronized state.

## P3

### P3: Default local secrets are intentionally weak outside production

Evidence:

- `backend/config/config.go:41-48` and `backend/config/config.go:76-79` define development defaults.
- Production validation exists at `backend/config/config.go:104-120`.

Why it matters:

This is normal for local development. The risk is misconfigured staging/prod with `APP_ENV` not set to `production`, which bypasses validation.

Recommended direction:

Ensure deployment sets `APP_ENV=production`; optionally treat any public deployment environment as production-like.

### P3: Course taxonomy has two overlapping models

Evidence:

- Structured `Level`, `Module`, `Topic` models exist in `backend/models/models.go`.
- `Lesson` and `Exercise` also carry string `Level` and `Module` fields.

Why it matters:

This can be pragmatic during migration, but it creates room for admin inconsistencies: a level/module can exist as structured rows, as strings on lessons/exercises, or both.

Recommended direction:

Decide whether structured taxonomy is authoritative. If yes, gradually move lessons/exercises to foreign keys or maintain a clear synchronization rule.

## Watchlist

- Email verification is created but registration currently returns success and discards the generated token in the handler. This may be intentional while SMTP is not configured, but it should match login behavior and onboarding copy.
- `GET /api/levels` calls `AdminGetLevels`; this is probably just handler reuse, but the name is misleading.
- `RequiresPremium` is always `true` for all certificate DTOs, even course/trainer certificates. That may be a deliberate “download/email requires Pro” model, but the field name may confuse frontend/product logic.
