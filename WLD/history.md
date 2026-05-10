# Work History

## 2026-05-10 - WLD Folder Capsule

Focus:

- Convert the single WLD file into a full recovery capsule.

Completed:

- Created `WLD/` folder.
- Added index, current focus, architecture snapshot, work history, action registry, recovery checklist, and update protocol.
- Preserved prior work history from `worklogdoc.md`.
- Kept root `worklogdoc.md` as a pointer to the new WLD capsule.

Verification:

- WLD files created and linked from README/worklogdoc.

Blockers:

- None.

Next action:

- Continue PostgreSQL persistence validation.

## 2026-05-08 - WLD Created

Focus:

- Create persistent project work journal so work can resume cleanly after context resets or limit refreshes.

Completed:

- Added `worklogdoc.md` at the project root.
- Captured current product focus, next action, project state, important commands, and known caveats.
- Established the rule that WLD should be updated after every meaningful work block.

Verification:

- File created in project root.

Blockers:

- None.

Next action:

- Continue infrastructure validation: enable Docker/PostgreSQL path or add a fallback local Postgres setup if Docker is unavailable.

## 2026-05-03 - Domain and Local PostgreSQL Infrastructure

Focus:

- Prepare project for `eracloud.pro` and persistent local development.

Completed:

- Added `docker-compose.yml` for local PostgreSQL.
- Added root scripts: `db:up`, `db:down`, `db:logs`, `db:migrate`.
- Added billing migration `infra/postgres/migrations/002_billing.sql`.
- Added Cloudflare/domain deployment doc `docs/08-domain-cloudflare-deployment.md`.
- Updated README, roadmap, and PostgreSQL documentation.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed with 5 tests.
- `npm.cmd run build` passed.

Blockers:

- Docker CLI was unavailable, so real container startup and DB migration could not be executed.

Next action:

- Install/enable Docker and run the real Postgres migration flow.

## 2026-05-03 - PostgreSQL Repository Layer

Focus:

- Decouple routes from in-memory storage and prepare API for persistent storage.

Completed:

- Added `EraStore` interface in `apps/api/src/storage/store.ts`.
- Converted routes to async store calls.
- Added `PostgresStore` implementation.
- Added store factory based on `STORAGE_DRIVER`.
- Added migration runner `apps/api/src/scripts/migrate.ts`.
- Updated `.env.example`.
- Added docs `docs/07-local-storage-and-postgres.md`.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed with 5 tests.
- `npm.cmd run build` passed.
- Local API and web responded successfully in memory mode.

Blockers:

- No live PostgreSQL verification yet.

Next action:

- Run Postgres-backed end-to-end API scenario.

## 2026-05-02 - Routing and Workload Lifecycle

Focus:

- Make ERA Cloud route workloads to providers.

Completed:

- Added routing engine with policies: `cheapest`, `balanced`, `low-latency`.
- Added `POST /api/v1/routing/simulate`.
- Added workload endpoints: create, list, get, stop.
- Added provider `capability_details`.
- Added routing/workload tests.
- Updated API docs and roadmap.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed with 5 tests.
- `npm.cmd run build` passed.
- Live HTTP scenario worked in memory mode.

Blockers:

- Data was still in memory at this point.

Next action:

- Add PostgreSQL persistence.

## 2026-04-23 - Monorepo and First API/Web Skeleton

Focus:

- Turn product docs into a runnable project skeleton.

Completed:

- Added npm workspace monorepo.
- Added `apps/api`, `apps/web`, and `packages/common`.
- Added Fastify API with health, tenants, providers.
- Added Next.js dashboard shell.
- Added first PostgreSQL migration `001_initial.sql`.
- Added `.env.example`, `.gitignore`, package scripts, TypeScript config.

Verification:

- `npm.cmd run typecheck` passed.
- `npm.cmd test` passed.
- `npm.cmd run build` passed.
- API health returned `ok`; web returned `200 OK`.

Blockers:

- No Git repository initialized at that time.

Next action:

- Add routing/workload functionality.

## 2026-03-29 - Product and Architecture Specification

Focus:

- Define ERA Cloud MVP as a broker/control-plane instead of owning infrastructure from day one.

Completed:

- Added README and core docs:
- `docs/01-product-mvp.md`
- `docs/02-system-architecture.md`
- `docs/03-api-contracts-v1.md`
- `docs/04-data-model-postgres.md`
- `docs/05-routing-policies.md`
- `docs/06-roadmap-12-weeks.md`

Verification:

- Documentation files created and reviewed structurally.

Blockers:

- No implementation existed yet.

Next action:

- Bootstrap monorepo.

