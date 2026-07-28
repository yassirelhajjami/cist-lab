# Trusted Progression Deployment

## What changed

Student identity, progress, XP, coins, mission completion, levels, badge awards, and reward notifications are now committed by one authenticated Postgres transaction.

The browser calls:

`POST /api/progression/complete`

Badge reconciliation also has a dedicated current-student endpoint:

`POST /api/progression/badges/evaluate`

It accepts no student, badge, XP, coin, level, or progress input. The database
derives the active student from `auth.uid()`, calculates requirements from
database-owned rows, and inserts only qualifying awards.

The route verifies the Supabase session and calls the authenticated RPC. The RPC:

1. derives the profile and student from `auth.uid()`;
2. locks the profile economy row;
3. validates a published lesson/challenge;
4. checks challenge output against the database-owned expected output;
5. inserts or updates progress once;
6. uses unique progress indexes and a reward-event ledger to prevent duplicate rewards;
7. completes the mission only when every database lesson/challenge is complete;
8. calculates XP, coins, level, and rank, then calls the same trusted badge evaluator;
9. inserts notifications inside the same transaction.

No service-role key is sent to the browser or used by the completion route.

## Migration

Apply this migration to a **staging project first**:

[20260723120403_trusted_progression_rewards.sql](supabase/migrations/20260723120403_trusted_progression_rewards.sql)

Recommended CLI workflow:

```powershell
npx supabase link --project-ref YOUR_STAGING_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
npx supabase db lint --linked --level warning
```

The current environment did not have a running local Postgres/Docker instance, so `db lint --local` could not connect. Do not treat the successful Next.js build as a substitute for running the migration against staging.

## Required staging checks

1. Sign in as a student and complete a lesson.
2. Confirm exactly one lesson progress row and one lesson reward event.
3. Click completion again and confirm XP/coins do not change.
4. Submit an incorrect challenge output directly to the API and confirm HTTP 422.
5. Submit a correct challenge and confirm its reward comes from the `challenges` row, not the request.
6. Complete the last mission activity and confirm the mission row and mission reward are created once.
7. Confirm badge thresholds award only one `student_badges` row.
8. Call `POST /api/progression/badges/evaluate` twice and confirm the second response has an empty `awarded` array and creates no duplicate row or notification.
9. Confirm notification rows appear only when a reward or badge is committed.
10. Attempt to call the private evaluator through the Data API and confirm it is unavailable because `private` is not exposed.
11. Attempt to update `profiles.xp`, `coins` upward, `level`, or `rank_title` with the authenticated browser client and confirm PostgreSQL error `42501`.
12. Attempt to insert/update `student_progress` or `student_badges` directly and confirm RLS rejects it.
13. Sign in as student A and verify no request can choose student B.
14. Confirm ordinary avatar/profile edits still work and cosmetic purchases can decrease—but never increase—coins.

## Automated security tests

Run the application security tests:

```powershell
npm run test:security
```

Run the RLS, moderation, badge/XP/coin protection, and completion idempotency
tests against a started local Supabase stack:

```powershell
npx supabase start
npm run test:database
```

The pgTAP suite is transaction-wrapped and rolls back its fixtures. It lives at
`supabase/tests/database/progression_security.test.sql`.

CI should run both commands after applying all migrations. Do not run the
database suite against production.

## Important curriculum requirement

Trusted completion requires UUID-backed, published curriculum records in Supabase. Local fallback IDs such as `l11` are intentionally rejected with HTTP 409 because they have no database row the server can validate.

Before production, ensure all missions, lessons, and challenges used by students are synchronized into the Supabase curriculum tables.

## Remaining game-mode rewards

Arcade, Puzzle Temple, and Robotics currently contain separate client game engines. Direct profile reward increases are blocked by the new profile guard after migration. Each mode now needs a server validator that accepts the student solution/command sequence, replays it against server-owned level definitions, and then writes a fixed idempotent reward event.

Do not add a generic “award XP” endpoint. That would recreate the vulnerability this migration removes.
