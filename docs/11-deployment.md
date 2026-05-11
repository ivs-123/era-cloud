# ERA Cloud Deployment

## Domain: eracloud.pro

DNS managed via Cloudflare. Target hostnames:

| Subdomain | Target | Purpose |
|-----------|--------|---------|
| `eracloud.pro` | Web server | Landing page + dashboard |
| `www.eracloud.pro` | CNAME → eracloud.pro | Alias |
| `app.eracloud.pro` | Web server | Customer control panel |
| `api.eracloud.pro` | API server | Backend API |
| `docs.eracloud.pro` | Docs host | Documentation |
| `status.eracloud.pro` | Status page | Uptime monitor |

## Docker Deployment (single VPS)

```bash
# Build and start all services
docker compose up -d --build

# Run migrations
docker compose exec api node apps/api/dist/scripts/migrate.js

# Check health
curl http://localhost:4000/health
curl http://localhost:3000
```

## Production services (recommended)

### API: Railway / Render / Fly.io
```
Build: Dockerfile → target api
Port: 4000
Env:
  STORAGE_DRIVER=postgres
  DATABASE_URL=<managed-postgres-url>
  THUNDER_API_URL=https://api.thundercompute.com:8443/v1
  THUNDER_API_TOKEN=<token>
```

### Web: Vercel
```
Framework: Next.js
Root: apps/web
Build: cd ../.. && npm run build --workspace @era/common && npm run build --workspace @era/web
Output: apps/web/.next
Env:
  NEXT_PUBLIC_API_URL=https://api.eracloud.pro
```

### Database: Neon / Supabase / Railway Postgres
```
Connection string: postgres://...
Migrations: infra/postgres/migrations/
```

## Cloudflare DNS setup for eracloud.pro

```
# Apex domain → Vercel
eracloud.pro        CNAME   cname.vercel-dns.com

# API subdomain → Railway/Render
api.eracloud.pro    CNAME   <railway-app>.up.railway.app

# WWW alias
www.eracloud.pro    CNAME   eracloud.pro

# App subdomain (can point to same Vercel deployment)
app.eracloud.pro    CNAME   cname.vercel-dns.com
```

## Quick local test

```powershell
# Terminal 1: API
$env:STORAGE_DRIVER="memory"
npm.cmd run dev:api

# Terminal 2: Web
npm.cmd run dev:web

# Open http://localhost:3000
```
