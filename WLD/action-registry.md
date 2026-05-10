# Action Registry

This registry tracks meaningful project actions and the artifacts they changed.

## Registry Format

- Date
- Action
- Files/Areas
- Verification
- Notes

## Actions

### 2026-05-10

Action:

- Full-stack integration sprint: providers, dashboard, billing, Git.

Files/Areas:

- `apps/api/src/providers/adapter.ts`
- `apps/api/src/providers/thunder-compute.ts`
- `apps/api/src/providers/registry.ts`
- `apps/api/src/providers/planned-adapters.ts`
- `apps/api/src/routes/provider-bridge.ts`
- `apps/api/src/routes/billing.ts`
- `apps/api/src/services/billing-engine.ts`
- `apps/api/src/storage/store.ts`
- `apps/api/src/storage/memory-store.ts`
- `apps/api/src/storage/postgres-store.ts`
- `apps/api/src/config.ts`
- `apps/api/src/app.ts`
- `apps/web/app/page.tsx`
- `apps/web/app/api-client.ts`
- `apps/web/app/styles.css`
- `packages/common/src/index.ts`
- `.env.example`
- `.git/`

Verification:

- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`

Notes:

- Git initialized, 2 commits.
- 19 API endpoints implemented.
- 8 providers defined (1 live + 7 planned).
- Billing engine with metering/invoice generation.

### 2026-05-10

Action:

- Created WLD recovery capsule folder.

Files/Areas:

- `WLD/README.md`
- `WLD/current-focus.md`
- `WLD/architecture-snapshot.md`
- `WLD/history.md`
- `WLD/action-registry.md`
- `WLD/recovery-checklist.md`
- `WLD/update-protocol.md`
- `worklogdoc.md`
- `README.md`

Verification:

- Documentation structure created.

Notes:

- Future work blocks should update WLD after implementation and verification.

### 2026-05-03

Action:

- Added Cloudflare/domain plan and local PostgreSQL Docker setup.

Files/Areas:

- `docker-compose.yml`
- `infra/postgres/migrations/002_billing.sql`
- `docs/08-domain-cloudflare-deployment.md`
- `docs/07-local-storage-and-postgres.md`
- `docs/06-roadmap-12-weeks.md`
- `package.json`
- `README.md`

Verification:

- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`

Notes:

- Docker unavailable in current environment, so container flow was not executed.

### 2026-05-03

Action:

- Added repository abstraction and PostgreSQL store.

Files/Areas:

- `apps/api/src/storage/store.ts`
- `apps/api/src/storage/postgres-store.ts`
- `apps/api/src/storage/index.ts`
- `apps/api/src/storage/memory-store.ts`
- `apps/api/src/routes/*.ts`
- `apps/api/src/scripts/migrate.ts`
- `.env.example`

Verification:

- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`

Notes:

- PostgreSQL code compiles but needs live DB validation.

### 2026-05-02

Action:

- Added routing and workload lifecycle.

Files/Areas:

- `apps/api/src/services/routing-engine.ts`
- `apps/api/src/routes/routing.ts`
- `apps/api/src/routes/workloads.ts`
- `apps/api/src/storage/memory-store.ts`
- `apps/api/test/routing-workloads.test.ts`
- `packages/common/src/index.ts`

Verification:

- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`

Notes:

- Live memory-mode HTTP scenario worked.

### 2026-04-23

Action:

- Bootstrapped runnable monorepo.

Files/Areas:

- `package.json`
- `package-lock.json`
- `tsconfig.base.json`
- `.env.example`
- `.gitignore`
- `apps/api`
- `apps/web`
- `packages/common`
- `infra/postgres/migrations/001_initial.sql`

Verification:

- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`

Notes:

- PowerShell blocks `npm.ps1`; use `npm.cmd`.

### 2026-03-29

Action:

- Created product and architecture documentation.

Files/Areas:

- `README.md`
- `docs/01-product-mvp.md`
- `docs/02-system-architecture.md`
- `docs/03-api-contracts-v1.md`
- `docs/04-data-model-postgres.md`
- `docs/05-routing-policies.md`
- `docs/06-roadmap-12-weeks.md`

Verification:

- Documentation structure created.

Notes:

- Product strategy: broker/control-plane first, own infrastructure later.

