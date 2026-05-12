# Recovery Checklist

Use this when resuming the project after a pause or context loss.

## 1. Read State

Open in order:

1. `WLD/README.md`
2. `WLD/current-focus.md`
3. `WLD/architecture-snapshot.md`
4. `WLD/history.md`
5. `WLD/action-registry.md`

## 2. Inspect Workspace

```powershell
git log --oneline
git status --short
```

## 3. Verify Tooling

```powershell
node --version   # >=22
npm.cmd --version
```

## 4. Verify Project

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## 5. Run Dev Environment

```powershell
# Terminal 1: API
$env:STORAGE_DRIVER="memory"
npm.cmd run dev:api

# Terminal 2: Web
$env:NEXT_PUBLIC_API_URL="http://localhost:4000"
npm.cmd run dev:web
```

Expected:
- API health: `http://localhost:4000/health`
- Web: `http://localhost:3000`

## 6. Test Full Flow

```powershell
# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"tenant_name":"Test","email":"test@test.com","password":"pass123456"}'

# Copy token from response, then sync providers
$token = "<JWT from above>"
curl -X POST http://localhost:4000/api/v1/providers/hetzner/sync \
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{}'

# Create workload
curl -X POST http://localhost:4000/api/v1/workloads \
  -H "Content-Type: application/json" -H "Authorization: Bearer $token" \
  -d '{"tenant_id":"<id>","kind":"server","profile":"gpu-h100","region":"us-east","routing_policy":"cheapest"}'

# Check benchmark
curl http://localhost:4000/api/v1/benchmark/gpu
```

## 7. Key Files Reference

- Auth: `apps/api/src/services/auth.ts`, `apps/api/src/routes/auth.ts`, `apps/api/src/middleware/auth.ts`
- Providers: `apps/api/src/providers/adapter.ts`, `apps/api/src/providers/all-adapters.ts`, `apps/api/src/providers/inference-adapters.ts`
- Routing: `apps/api/src/services/routing-engine.ts`, `apps/api/src/services/gpu-normalizer.ts`
- Billing: `apps/api/src/services/billing-engine.ts`, `apps/api/src/routes/billing.ts`
- Frontend: `apps/web/app/page.tsx`, `apps/web/app/welcome.tsx`, `apps/web/app/auth.tsx`, `apps/web/app/api-client.ts`
- Deployment: `Dockerfile`, `docker-compose.yml`, `docs/11-deployment.md`
- Docs: `docs/10-business-canvas.md`, `docs/09-partnership-strategy.md`

## 8. Update WLD

After work is complete:

1. Append `WLD/history.md`
2. Append `WLD/action-registry.md`
3. Update `WLD/current-focus.md`
4. Update `WLD/architecture-snapshot.md` if architecture changed
