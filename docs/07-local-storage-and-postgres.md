# Local Storage and PostgreSQL

ERA Cloud API supports two storage modes.

## Memory Mode

Default mode for local development and tests.

```powershell
$env:STORAGE_DRIVER="memory"
npm.cmd run dev:api
```

Data is lost when the API process restarts.

## PostgreSQL Mode

Use PostgreSQL when data should persist between API restarts.

```powershell
$env:STORAGE_DRIVER="postgres"
$env:DATABASE_URL="postgres://era:era@localhost:5432/era_cloud"
npm.cmd run db:up
npm.cmd run db:migrate
npm.cmd run dev:api
```

Equivalent direct API workspace commands:

```powershell
$env:STORAGE_DRIVER="postgres"
$env:DATABASE_URL="postgres://era:era@localhost:5432/era_cloud"
npm.cmd run migrate --workspace @era/api
npm.cmd run dev:api
```

The migration runner applies SQL files from `infra/postgres/migrations` and records applied files in `schema_migrations`.

## Current Repository Coverage

PostgreSQL-backed routes:

- tenants
- providers and provider capabilities
- workloads
- routing decisions for real workloads

Routing simulations do not persist audit rows unless tied to a tenant/workload.
