# CIST CodeQuest Platform — Technical Audit Report

**Audit date:** 21 July 2026  
**Repository:** `cist-codequest`  
**Scope:** source code, local SQL/migrations, configuration, dependency manifest, build and lint health  
**Not in scope:** live Supabase configuration/data, deployed environment, browser-based end-to-end testing, load testing, and external webhook delivery

## 1. Executive summary

CIST CodeQuest is a substantial, feature-rich educational platform. It has separate student and administrator experiences, missions and lessons, code and robotics labs, games, community features, projects, badges, leaderboards, reports, notifications, Supabase authentication/data/storage, and a local-data fallback. The application compiles successfully with Next.js 16.2.9 and TypeScript, and its relational schema has useful foreign keys, uniqueness constraints, and RLS enabled on the principal tables.

The project is **not ready for an internet-facing production release in its current state**. The primary reason is security rather than compilation:

1. `/api/webhook` is an unauthenticated server-side fetch proxy accepting a caller-controlled URL. This is a critical SSRF and abuse risk.
2. The exported admin Server Actions use a Supabase service-role client but perform no authentication or admin authorization of their own. Client-side route guards do not protect callable Server Actions.
3. the auth signup trigger accepts the new user's editable `raw_user_meta_data.role`; a self-registering user may be able to create an admin profile.
4. Student rewards and several state transitions are calculated in the browser and written directly through the anon client. RLS limits row ownership, but it does not validate reward amounts or legal state transitions, so students can tamper with their own XP, coins, score, completion data, and some profile fields.
5. The engineering quality gate fails with 340 ESLint findings, and there is no automated test suite.

**Overall assessment:** promising functional prototype / late-stage MVP, with a good visual and domain breadth, but requiring a focused security and reliability hardening phase before production.

| Area | Assessment | Notes |
|---|---:|---|
| Product breadth | Strong | Broad student/admin functionality and engaging learning features |
| Build/type health | Good | Production build and TypeScript pass |
| Authentication/authorization | Critical risk | Privileged actions and role provisioning need server-side enforcement |
| Data integrity | High risk | Client-authoritative rewards and non-atomic counters |
| Database baseline | Mixed | RLS and constraints exist, but policies/functions need hardening |
| Maintainability | Weak | Very large components/services, extensive `any`, lint failure |
| Automated testing | Critical gap | No unit, integration, or end-to-end tests found |
| Operational readiness | Weak | Minimal configuration, no health/observability strategy, generic README |

## 2. Project overview

### Technology stack

- Next.js 16.2.9 App Router with Turbopack
- React 19.2.4 and TypeScript 5 in strict mode
- Supabase Auth, Postgres/Data API, SSR helpers, and Storage
- Tailwind CSS 4
- Recharts, Lucide React, and canvas-confetti
- Browser `localStorage` fallback/mock database

### Application surfaces

The build discovers 30 routes. Student routes cover the dashboard, missions, projects, badges, leaderboard, community, profile, code lab, Scratch, robotics, arcade, and games. Admin routes cover students, missions, lessons, challenges, projects, badges, community moderation, leaderboard requests, reports, and settings. Two dynamic APIs provide student-record self-healing and webhook forwarding.

### Data architecture

`src/lib/db/service.ts` is a 1,546-line browser-oriented service that selects between Supabase and a local mock store. The same service contains authentication, profiles, students, content, progress, rewards, projects, votes, community, badges, reports, leaderboard, and notification logic. Supabase calls generally use the public anon client; effective access control is therefore delegated to SQL RLS. A separate service-role client is used by admin Auth actions and the ensure-student endpoint.

This dual-mode architecture is useful for demos, but it creates two materially different security and persistence models. A missing Supabase configuration silently enables a client-side mock platform with default/example passwords and browser-editable state. Production should fail closed instead.

## 3. Critical findings

### C1 — Unauthenticated SSRF/webhook relay

**Evidence:** `src/app/api/webhook/route.ts:3-23` accepts `webhookUrl` from an arbitrary POST body and immediately calls `fetch(webhookUrl)`. There is no authentication, role check, hostname allowlist, protocol restriction, private-network blocking, payload limit, timeout, or rate limit.

**Impact:** an attacker can use the deployed server to probe internal services and cloud metadata endpoints, send unwanted requests to third parties, consume bandwidth/functions, and reflect portions of upstream responses. Because the route is public, hiding the settings UI does not mitigate it.

**Recommendation:** remove caller-supplied URLs. Store an encrypted destination server-side, authorize the caller as an admin, allowlist only expected HTTPS hosts, reject redirects and private/link-local/reserved IP ranges, cap body and response sizes, add an abort timeout and rate limiting, and return generic upstream errors. Prefer a dedicated provider integration or queued server-side event dispatcher.

### C2 — Service-role Server Actions do not authorize callers

**Evidence:** `src/app/admin/actions.ts:14-79` exports `createStudentAuth` and `updateStudentAuth`. Both use `supabaseAdmin.auth.admin.*`, but neither validates the caller's Supabase session nor confirms an admin role. They accept raw email/password arguments and the update path lists all Auth users. The only visible protection of `/admin` is the client-side `RoleGuard` in `src/app/admin/layout.tsx`.

**Impact:** Server Actions are independently reachable mutation endpoints. A non-admin who can invoke or replay them may create confirmed Auth users or reset passwords. The service-role key bypasses RLS, so this boundary must be explicit.

**Recommendation:** begin every privileged action with a server-side authorization helper using cookie-backed Supabase auth (`getUser`/verified claims), then query trusted profile/app metadata for the admin role. Validate inputs with a schema, add password policy and audit logging, avoid scanning the entire user list, and rate-limit sensitive operations. Keep the service-role client server-only.

### C3 — User-editable metadata is trusted for role assignment

**Evidence:** `supabase_schema.sql:265-298`, especially line 288, sets a new profile's role from `NEW.raw_user_meta_data->>'role'` with an admin-capable fallback expression. Supabase user metadata is user-editable and must not be used for authorization.

**Impact:** if public signup is enabled, a caller could request `role: admin` during signup and receive an administrator profile. `public.is_admin()` would then treat the account as privileged across RLS policies.

**Recommendation:** always assign `student` in the signup trigger. Promote administrators only through a separately authorized server/admin workflow. If role claims are needed in JWTs, use controlled app metadata and account for token refresh latency. Add a migration that replaces the trigger and audit existing admin profiles.

## 4. High-severity findings

### H1 — Rewards and learning completion are client-authoritative

**Evidence:** `src/lib/db/service.ts:388-405` reads a profile and directly writes `xp`, `coins`, `level`, and `rank_title`; `completeLesson` and `completeChallenge` accept IDs, rewards, scores, time, and attempt counts from browser code (`:737-834`). The profile update policy at `supabase_schema.sql:236-256` prevents changes only to `role` and `status`, leaving reward fields user-writable.

**Impact:** an authenticated student can use the Supabase client or browser console to award arbitrary XP/coins, change levels/ranks, submit fabricated scores, or complete activities without satisfying application rules. Read-then-write also loses updates under concurrency.

**Recommendation:** revoke direct student updates to economic/achievement fields. Move completion and reward calculation into narrowly scoped server-side functions or authorized route/actions. Derive rewards from database-owned challenge/lesson records, validate ownership and prerequisites, and update completion plus rewards atomically in one transaction. Restrict self-profile edits to an explicit allowlist of cosmetic fields.

### H2 — Privileged business operations rely on UI placement and RLS

**Evidence:** moderation, badge award/revoke, student deletion, content management, and report-related mutations reside in the shared browser service. The application uses client-only `RoleGuard` (`src/components/ui/RoleGuard.tsx`) and client layouts for route access.

**Impact:** UI redirects are not an authorization control. RLS helps, but any missing/misapplied policy or deployment drift exposes a privileged operation. Multi-step mutations can partially complete and are hard to audit.

**Recommendation:** enforce authorization at every data-access boundary. Move high-value admin workflows to server actions/routes with a shared `requireAdmin()` helper and transactions/RPCs. Add middleware/proxy or server layouts for early route denial, while retaining RLS as defense in depth.

### H3 — Security-definer functions are insufficiently hardened

**Evidence:** `public.is_admin`, `public.check_profile_update`, and `public.handle_new_user` are `SECURITY DEFINER` functions in the exposed `public` schema (`supabase_schema.sql:222-298`). The SQL shown does not set a safe `search_path` or revoke default `PUBLIC` execute privileges.

**Impact:** security-definer functions execute with elevated privileges. Public executability and a mutable search path enlarge the privilege-escalation surface. Trigger functions need not be directly callable by application roles.

**Recommendation:** place privileged helpers in a private schema where practical, set `search_path = ''` and fully qualify objects, revoke execute from `PUBLIC`, and grant only the minimum required roles/functions. Confirm this against the deployed database and run Supabase security/performance advisors.

### H4 — Non-atomic denormalized counters can drift

**Evidence:** votes and likes are inserted, followed by separate read/increment/update calls (`src/lib/db/service.ts:1041-1048` and `:1211-1221`). Deletion/retraction does not visibly guarantee symmetric counter updates. Similar multi-call workflows exist for moderation/rewards.

**Impact:** concurrent requests lose increments; failed second operations leave counter and relation tables inconsistent. Clients may see inaccurate ranking/community counts.

**Recommendation:** make the join table the source of truth or maintain counters with database triggers. If counters are required, use a single transaction/RPC with conflict handling and idempotency.

## 5. Medium-severity findings

### M1 — Broad exposure of student/profile data

`profiles` are selectable by everyone (`supabase_schema.sql:233-234`), and the full students table is viewable by any authenticated role (`:309-310`). Application queries use `select('*')`, potentially exposing emails, grades, classroom, notes, status, XP, and internal identifiers more widely than necessary. For a student platform, data minimization is particularly important.

Create public-safe views with `security_invoker = true`, restrict base-table policies to self/admin, explicitly select required columns, and review whether leaderboard/community pages need names, avatars, or only pseudonyms.

### M2 — Deprecated/weak RLS patterns and incomplete policy hardening

The students policy uses deprecated `auth.role()` instead of `TO authenticated`. Several `FOR ALL` policies specify only `USING`; explicit `WITH CHECK` improves clarity and prevents unintended row reassignment. The student progress update policy has no explicit `WITH CHECK`. RLS is enabled, which is positive, but the policies should be rewritten with `(select auth.uid())`, explicit roles, ownership predicates, and separate operations.

### M3 — Migration history is inconsistent and non-idempotent

The repository contains a monolithic `supabase_schema.sql` plus `001_phase1_schema.sql` and `002_add_courses_table.sql`; both numbered migrations create courses with different select policies. `CREATE POLICY` statements are not guarded, so replaying the full schema over an existing database can fail. Filenames do not use normal timestamped Supabase migration conventions.

Adopt one authoritative migration chain generated by the Supabase CLI, establish a baseline for the current deployed schema, test reset/replay in CI, and remove or clearly label seed/bootstrap SQL.

### M4 — Silent local fallback is unsafe for production

If public Supabase variables are missing, the app switches to mock authentication and browser `localStorage`. Mock passwords/defaults and mutable client data are appropriate for a demo only. In production this can present a convincing but non-persistent, insecure application rather than failing configuration checks.

Require an explicit development-only flag for mock mode and throw during production startup when required variables are absent. Clearly badge demo mode in the UI and isolate mock code from the production bundle where possible.

### M5 — Webhook secrets and logs are stored in localStorage

`src/utils/webhook.ts` and the admin settings page store the full webhook URL and logs in browser storage. Any same-origin XSS can extract the URL; different admin devices do not share configuration; clearing storage loses it; local logs are not trustworthy audit records.

Store webhook configuration encrypted on the server, reveal only a masked value, and write structured audit records to a protected server-side store without tokens or sensitive payloads.

### M6 — Dependency advisory remains open

`npm audit --omit=dev` reports two moderate vulnerabilities: Next.js carries a vulnerable PostCSS version affected by GHSA-qx2v-qp2m-jg93. The automatic audit suggestion would downgrade Next to 9.3.3 and is therefore unsafe.

Track an upstream Next.js release that includes PostCSS 8.5.10 or later, test the supported upgrade, and do not run `npm audit fix --force` blindly.

## 6. Code quality and maintainability

### Automated checks

- `npm run build`: **passed**. Next.js compilation, TypeScript, page-data collection, and static generation all completed successfully.
- `npm run lint`: **failed** with **340 findings: 242 errors and 98 warnings**.
- Automated tests: **none found**.
- Production dependency audit: **2 moderate vulnerabilities**.

Lint errors include React state updates inside effects, impure operations such as `Math.random()` during rendering, extensive explicit `any`, and other hook/type issues. Warnings include unused imports/variables and widespread raw `<img>` use. Because `next build` no longer runs ESLint as part of the build, a successful build does not mean the lint gate is healthy.

### Complexity hotspots

- `src/app/(student)/games/page.tsx`: 1,894 lines
- `src/lib/db/service.ts`: 1,546 lines
- `src/app/(student)/arcade/page.tsx`: 1,266 lines
- `src/lib/db/mock-data.ts`: 779 lines
- `src/app/(student)/code-lab/page.tsx`: 708 lines
- `src/app/admin/missions/page.tsx`: 651 lines
- `src/app/admin/students/page.tsx`: 593 lines
- `src/app/admin/reports/page.tsx`: 589 lines

These sizes make review, testing, state reasoning, and change isolation difficult. Split the database layer by domain, generate Supabase database types, extract game engines/state machines from presentation components, and move repeated modal/form/table patterns into tested components. Avoid a broad shared service returning `any`-shaped joined records.

### Error handling and consistency

Several paths catch errors and silently fall back to local mock data. This can hide outages and mix real and demo behavior. Some update calls do not inspect returned errors. There is no structured error taxonomy, correlation ID, or monitoring integration. User-facing operations should distinguish validation, authorization, network, and server failures, while server logs should retain enough context without exposing secrets.

### Documentation

The README is still the default create-next-app text and does not describe the platform, environment variables, mock mode, Supabase bootstrap/migrations, role model, webhook configuration, test process, deployment, or troubleshooting. This is a significant onboarding and operational gap.

## 7. Performance and UX observations

The app pre-renders most routes successfully, which is a useful baseline. However, almost all substantive data loading happens after hydration through client components and a global client context. This increases JavaScript shipped to the browser, delays authenticated content, can create loading flashes, and prevents server rendering from enforcing access or efficiently fetching initial data.

Recommended direction:

- Use server components for initial authenticated reads and page shells.
- Keep interactive islands client-side instead of making whole layouts/pages client components.
- Select only required database columns and paginate large admin/community/report lists.
- Add indexes based on measured query plans, especially foreign keys and common status/order/filter columns; constraints alone do not automatically index every foreign key.
- Replace raw `<img>` for important local imagery with `next/image` where appropriate.
- Lazy-load heavyweight labs/games and charting code.
- Measure with browser performance tooling and real production data before setting budgets.

## 8. Positive findings

- The production build is healthy under the installed Next.js version.
- TypeScript strict mode is enabled.
- Environment files are ignored by Git; `.env.local` was not exposed in this report.
- The service-role module imports `server-only`, reducing accidental client bundling.
- The ensure-student route validates a bearer token and confirms the associated profile is a student before using service-role writes.
- Core tables have primary keys, foreign keys, checks, and several useful uniqueness constraints.
- RLS is enabled on the main exposed tables.
- Ownership checks exist for progress, projects, posts, comments, votes, likes, and leaderboard requests.
- Storage enforces a 5 MB limit and image MIME allowlist, and update/delete rules check ownership/admin status.
- The application offers strong feature breadth and a coherent educational/gamification concept.

## 9. Recommended remediation roadmap

### Phase 0 — Immediate release blockers (1–3 days)

1. Disable `/api/webhook` or replace it with an authenticated, allowlisted server configuration.
2. Add a server-side `requireAdmin()` check to every service-role Server Action and privileged route.
3. Replace metadata-derived signup roles with an unconditional `student` role; audit current admins.
4. Remove student write access to XP, coins, level, rank, moderation fields, and reward amounts.
5. Make production fail closed if required Supabase configuration is missing.
6. Rotate the service-role/webhook credentials if there is any chance they were exposed outside approved secret storage.

### Phase 1 — Data integrity and security (about 1 week)

1. Implement transactional RPC/server workflows for completion, rewards, moderation, votes, and likes.
2. Harden all RLS policies, security-definer functions, grants, and search paths.
3. Reduce profile/student visibility and introduce public-safe projections.
4. Add input validation, body limits, timeouts, rate limiting, CSRF/origin considerations, and audit events to sensitive endpoints.
5. Reconcile schema files into a reproducible migration chain and run Supabase advisors against the live project.

### Phase 2 — Quality gate and tests (1–2 weeks)

1. Fix the 242 ESLint errors; then make lint and `tsc --noEmit` mandatory in CI.
2. Add unit tests for rank/reward calculations and game engines.
3. Add database/RLS integration tests for anonymous, student A, student B, and admin personas.
4. Add end-to-end tests for login, role access, mission completion, project submission/moderation, and student management.
5. Add regression tests proving unauthenticated users cannot invoke privileged actions or arbitrary webhooks.

### Phase 3 — Architecture and operations (2–4 weeks)

1. Split `dbService` into domain modules and generate strongly typed Supabase bindings.
2. Move initial auth/data reads to server components and minimize client-only page trees.
3. Break large pages into presentation, state, and domain-engine layers.
4. Add structured logs, error monitoring, health checks, backups/recovery documentation, and deployment runbooks.
5. Replace the README with real setup, architecture, security, migration, and release documentation.
6. Establish dependency-update automation and performance/accessibility budgets.

## 10. Suggested production acceptance criteria

The platform should not be approved for production until all of the following are true:

- No unauthenticated arbitrary outbound-fetch endpoint exists.
- Every service-role operation verifies an authorized administrator server-side.
- New users cannot influence their authorization role through user metadata.
- Students cannot directly set rewards, scores, completion, moderation, or other trusted fields.
- RLS persona tests pass against a clean database created solely from migrations.
- Build, TypeScript, lint, unit, integration, and critical end-to-end checks pass in CI.
- Secrets/configuration fail closed and are stored server-side.
- The deployed Supabase project has been checked with security/performance advisors.
- Logging, error monitoring, backup/recovery, and rollback procedures are documented and tested.

## 11. Audit limitations

This was a static/local repository audit. No Supabase project connection was available, so the report cannot prove that the deployed schema matches `supabase_schema.sql`, inspect actual grants/advisors, validate Auth provider settings or signup enablement, or test policies with real JWT personas. No running browser session was used, so visual responsiveness, accessibility behavior, and end-to-end learning flows remain unverified. Those checks should follow immediately after the critical code fixes.
