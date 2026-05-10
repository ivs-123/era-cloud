# ERA Cloud WLD

WLD is the recovery capsule for ERA Cloud.

Use it when context is lost, limits reset, work resumes after a pause, or a new collaborator needs to understand the project quickly.

## Reading Order

1. [Current Focus](current-focus.md)
2. [Architecture Snapshot](architecture-snapshot.md)
3. [Work History](history.md)
4. [Action Registry](action-registry.md)
5. [Recovery Checklist](recovery-checklist.md)
6. [Update Protocol](update-protocol.md)

## What WLD Must Preserve

- What ERA Cloud is and why it exists.
- What has already been built.
- What is currently blocking progress.
- What commands verify the project.
- What the next useful action is.
- Which files matter for recovery.

## Current Next Action

Enable Docker or provide another local PostgreSQL runtime, then run the persistent storage flow:

```powershell
npm.cmd run db:up
$env:STORAGE_DRIVER="postgres"
$env:DATABASE_URL="postgres://era:era@localhost:5432/era_cloud"
npm.cmd run db:migrate
npm.cmd run dev:api
```

Then validate tenant, provider, routing, workload creation, workload stop, API restart, and data persistence.

