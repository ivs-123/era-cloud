# Current Focus

## Product Direction

ERA Cloud is a broker/control-plane platform for compute, inference, and server capacity across external providers.

The business starts as:

- provider aggregator
- workload router
- unified control panel/API
- billing and clearing layer
- later hybrid cloud with own capacity

## Current Engineering Focus

Move from MVP skeleton to reliable persistent local development:

- finish PostgreSQL-backed end-to-end flow
- keep memory mode for fast tests
- prepare deployable app/API split for `eracloud.pro`
- keep WLD updated after each meaningful work block

## Current Next Step

Run real PostgreSQL persistence validation.

Expected flow:

1. Start PostgreSQL.
2. Apply migrations.
3. Run API with `STORAGE_DRIVER=postgres`.
4. Create tenant.
5. Register provider with `capability_details`.
6. Simulate routing.
7. Create workload.
8. Stop workload.
9. Restart API.
10. Confirm persisted tenant/provider/workload data remains available.

## Active Caveats

- Docker CLI was not available during the last infrastructure pass.
- PostgreSQL store compiles but has not been verified against a live database in this environment.
- `npm audit` reports 2 moderate findings from `next -> postcss`; force-fix suggests breaking Next downgrade and was not applied.
- Confirm whether this folder is a Git repository before relying on Git history.

