# Recovery Checklist

Use this checklist when resuming the project after a pause or context loss.

## 1. Read State

Open in order:

1. `WLD/README.md`
2. `WLD/current-focus.md`
3. `WLD/architecture-snapshot.md`
4. `WLD/history.md`
5. `WLD/action-registry.md`

## 2. Inspect Workspace

```powershell
Get-ChildItem -Force
git status --short
```

If this is not a Git repository, do not assume history exists.

## 3. Verify Tooling

```powershell
node --version
npm.cmd --version
docker --version
docker compose version
```

If Docker is unavailable, continue in memory mode or install/enable Docker before PostgreSQL validation.

## 4. Verify Project

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## 5. Run Local Memory Mode

```powershell
$env:STORAGE_DRIVER="memory"
npm.cmd run dev:api
npm.cmd run dev:web
```

Expected:

- API health: `http://localhost:4000/health`
- Web: `http://localhost:3000`

## 6. Run PostgreSQL Mode

```powershell
npm.cmd run db:up
$env:STORAGE_DRIVER="postgres"
$env:DATABASE_URL="postgres://era:era@localhost:5432/era_cloud"
npm.cmd run db:migrate
npm.cmd run dev:api
```

Expected validation:

1. Create tenant.
2. Register provider.
3. Simulate routing.
4. Create workload.
5. Stop workload.
6. Restart API.
7. Confirm persisted data remains.

## 7. Update WLD

After work is complete:

1. Append `WLD/history.md`.
2. Append `WLD/action-registry.md`.
3. Update `WLD/current-focus.md`.
4. Update `WLD/architecture-snapshot.md` if architecture changed.
5. Update `worklogdoc.md` only if the entry point changes.

