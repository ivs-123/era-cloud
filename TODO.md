# ERA Cloud — TODO

## Immediate (this week)

### Deployment
- [ ] **Cloudflare DNS:** add CNAME `eracloud.pro` → `ivs-123.github.io`
- [ ] **Cloudflare DNS:** add CNAME `www.eracloud.pro` → `eracloud.pro`
- [ ] **Render:** deploy API via `render.com/deploy?repo=https://github.com/ivs-123/era-cloud`
- [ ] **GitHub Actions:** set `NEXT_PUBLIC_API_URL` env var to Render API URL
- [ ] **GitHub Pages:** re-enable `eracloud.pro` custom domain after DNS propagates
- [ ] Set up `api.eracloud.pro` subdomain pointing to Render API

### Provider Tokens
- [ ] **DeepInfra** — register at deepinfra.com, get API key (5 min)
- [ ] **Groq** — register at console.groq.com, get API key (5 min)
- [ ] **Together AI** — register at together.ai, get API key (5 min)
- [ ] **Fireworks AI** — register at fireworks.ai, get API key (5 min)
- [ ] **Lepton AI** — register at lepton.ai, get API key (5 min)
- [ ] **Vast.ai** — register, deposit $10, get API key (15 min)
- [ ] **RunPod** — register at runpod.io, get API key (10 min)
- [ ] **Thunder Compute** — already have token via chat tools
- [ ] **Hetzner** — register with Georgia LLC docs (1-2 days)
- [ ] **Yandex Cloud** — start partner agreement process

### Post-Deploy Testing
- [ ] Test real inference routing with DeepInfra/Groq tokens
- [ ] Test real GPU server deployment via Thunder Compute
- [ ] Test BYOK flow with real provider keys
- [ ] Test billing: record usage + generate invoice
- [ ] Test rate limiting (600 req/min)

## Short-term (2-4 weeks)

### Infrastructure
- [ ] **PostgreSQL** — set up Docker or cloud PG (Neon/Supabase), validate PostgresStore
- [ ] **Git tag** — release v0.3
- [ ] **CI/CD** — add test run to GitHub Actions
- [ ] **Monitoring** — basic health check endpoint monitoring
- [ ] **Logging** — structured logging for production

### Product
- [ ] **Pricing page** — standalone `/pricing` page with full GPU comparison
- [ ] **Docs page** — API reference with curl examples
- [ ] **Status page** — `status.eracloud.pro`
- [ ] **Provider status live monitoring** — auto health-check all adapters
- [ ] **Email notifications** — signup confirmation, invoice ready
- [ ] **Invoice PDF export** — generate PDF invoices
- [ ] **Dashboard:** add real provider logos
- [ ] **Dashboard:** add provider detail page with specs + pricing
- [ ] **Dashboard:** add workload monitoring (uptime, cost tracking)

### Growth
- [ ] **LangChain integration** — PR to LangChain/LiteLLM as official provider
- [ ] **AWS Activate grant** — apply from Georgia LLC (up to $100K)
- [ ] **GCP Startup grant** — apply from Georgia LLC (up to $350K)
- [ ] **Product Hunt** — prepare launch
- [ ] **Dev.to / Medium** — write "How we built a 40-provider GPU cloud" article

## Medium-term (1-3 months)

### Features
- [ ] **Real-time GPU availability** — poll providers for actual instance counts
- [ ] **Auto-scaling** — spin up/down GPU servers based on demand
- [ ] **Spot/preemptible instance support**
- [ ] **Custom model hosting** — upload and serve custom models
- [ ] **Streaming inference** — SSE support in `/v1/chat/completions`
- [ ] **Multi-tenant isolation** — proper RBAC
- [ ] **Billing integration** — Stripe payments
- [ ] **Usage analytics** — per-tenant, per-provider, per-model dashboards
- [ ] **Terraform provider** — IaC for ERA Cloud resources
- [ ] **CLI tool** — `era deploy gpu h100 --region eu`

### Partnerships
- [ ] **Yandex Cloud** — official reseller agreement
- [ ] **VK Cloud** — agent/partner program (up to 35% margin)
- [ ] **Selectel** — referral + reseller
- [ ] **Alibaba Cloud** — AI Catalyst grant ($120K)
- [ ] **GitHub Marketplace** — list as verified app
- [ ] **Vercel Integration** — add-on marketplace

## Technical Debt

- [ ] Expand test coverage (currently 5 tests)
- [ ] Add integration tests for auth flow
- [ ] Add e2e tests for inference endpoint
- [ ] TypeScript strict mode
- [ ] ESLint setup
- [ ] Pre-commit hooks (lint + typecheck)
- [ ] Fix npm audit vulnerabilities
- [ ] API rate limiting — persistent storage (currently in-memory)
- [ ] Auth — persist users to PostgreSQL (currently in-memory)

## Decisions Pending

- [ ] **Brand:** `eracloud.pro` as main domain or `eraone` ecosystem umbrella?
- [ ] **Pricing:** SMB markup model vs fixed SaaS tiers vs usage-based?
- [ ] **Legal:** Georgia LLC — partner contracts, terms of service, privacy policy
