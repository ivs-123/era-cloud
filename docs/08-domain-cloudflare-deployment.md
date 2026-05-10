# Domain and Cloudflare Deployment

Production domain: `eracloud.pro`

DNS is managed in Cloudflare.

## Recommended Subdomains

- `eracloud.pro`: public website
- `www.eracloud.pro`: public website alias
- `app.eracloud.pro`: customer control panel
- `api.eracloud.pro`: backend API
- `docs.eracloud.pro`: product/API documentation
- `status.eracloud.pro`: status page

## DNS Plan

Initial records:

| Name | Type | Target | Proxy |
| --- | --- | --- | --- |
| `@` | CNAME/A | web hosting target | Proxied |
| `www` | CNAME | web hosting target | Proxied |
| `app` | CNAME | web app hosting target | Proxied |
| `api` | CNAME/A | API hosting target | Proxied |

Keep API and app as separate hostnames. It makes CORS, rate limits, logs, and future scaling much cleaner.

## Environment Targets

Local:

```powershell
API_PORT=4000
STORAGE_DRIVER=memory
```

Staging:

```powershell
API_PUBLIC_URL=https://api.staging.eracloud.pro
WEB_PUBLIC_URL=https://app.staging.eracloud.pro
STORAGE_DRIVER=postgres
```

Production:

```powershell
API_PUBLIC_URL=https://api.eracloud.pro
WEB_PUBLIC_URL=https://app.eracloud.pro
STORAGE_DRIVER=postgres
```

## Cloudflare Defaults

- SSL/TLS mode: Full (strict)
- Always Use HTTPS: enabled
- Brotli: enabled
- HTTP/3: enabled
- Minimum TLS version: TLS 1.2
- Cache API responses only after explicit cache headers are added

## First Public Deployment Shape

- Web dashboard: Vercel, Netlify, Cloudflare Pages, or any static/Next host
- API: container host, Fly.io, Render, Railway, VPS, or Cloudflare Workers later if we adapt the Fastify runtime
- DB: managed PostgreSQL or self-hosted PostgreSQL for early testing

Do not put provider credentials into Cloudflare DNS or public frontend environment variables. Provider API keys belong only in the backend runtime secret store.
