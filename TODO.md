# ERA Cloud - TODO

## Completed on 2026-05-13

- [x] Tightened API auth: operational routes now require Bearer JWT by default.
- [x] Fixed frontend API client to send JWT on dashboard, provider, workload, billing, BYOK, and sync calls.
- [x] Added tenant isolation checks for workloads, billing, BYOK, and provider instance creation.
- [x] Added security regression tests for unauthenticated access and cross-tenant billing access.
- [x] Added PostgreSQL tenant key migration and PostgresStore BYOK persistence.
- [x] Fixed PostgreSQL invoice generation by creating billing periods transactionally.
- [x] Relaxed provider FK constraints for BYOK and provider instance workloads that use external provider identifiers.
- [x] Added PGlite migration validation test for all SQL migrations.
- [x] Replaced plaintext password storage with scrypt password hashes in the in-memory auth MVP.
- [x] Replaced weak API key hashing with SHA-256.
- [x] Reduced npm audit risk: high severity findings fixed; remaining moderate issue is Next/PostCSS and requires unsafe force downgrade.

## Immediate (this week)

### Deployment

- [ ] Cloudflare DNS: add CNAME `eracloud.pro` -> `ivs-123.github.io`
- [ ] Cloudflare DNS: add CNAME `www.eracloud.pro` -> `eracloud.pro`
- [ ] Render: deploy API via `render.com/deploy?repo=https://github.com/ivs-123/era-cloud`
- [ ] GitHub Actions: verify `NEXT_PUBLIC_API_URL` points to Render API URL after deploy
- [ ] GitHub Pages: re-enable `eracloud.pro` custom domain after DNS propagates
- [ ] Set up `api.eracloud.pro` subdomain pointing to Render API

### Provider Tokens

- [ ] DeepInfra - register at deepinfra.com, get API key
- [ ] Groq - register at console.groq.com, get API key
- [ ] Together AI - register at together.ai, get API key
- [ ] Fireworks AI - register at fireworks.ai, get API key
- [ ] Lepton AI - register at lepton.ai, get API key
- [ ] Vast.ai - register, deposit test balance, get API key
- [ ] RunPod - register at runpod.io, get API key
- [ ] Thunder Compute - confirm token and production limits
- [ ] Hetzner - register with Georgia LLC docs
- [ ] Yandex Cloud - start partner agreement process

### Post-Deploy Testing

- [ ] Test real inference routing with DeepInfra/Groq tokens
- [ ] Test real GPU server deployment via Thunder Compute
- [ ] Test BYOK flow with real provider keys
- [ ] Test billing: record usage and generate invoice
- [ ] Test rate limiting at 600 req/min

## Short-Term (2-4 weeks)

### Infrastructure

- [ ] PostgreSQL - validate PostgresStore against live Docker/Neon/Supabase/Render PostgreSQL
- [ ] Git tag - release v0.3
- [ ] CI/CD - add test run to GitHub Actions
- [ ] Monitoring - basic health check endpoint monitoring
- [ ] Logging - structured production logging and request correlation

### Product

- [ ] Pricing page - standalone `/pricing` page with full GPU comparison
- [ ] Docs page - API reference with curl examples
- [ ] Status page - `status.eracloud.pro`
- [ ] Provider status live monitoring - auto health-check all adapters
- [ ] Email notifications - signup confirmation and invoice ready
- [ ] Invoice PDF export
- [ ] Dashboard: add real provider logos
- [ ] Dashboard: add provider detail page with specs and pricing
- [ ] Dashboard: add workload monitoring: uptime and cost tracking

### Growth

- [ ] LangChain/LiteLLM integration
- [ ] AWS Activate grant
- [ ] GCP Startup grant
- [ ] Product Hunt launch prep
- [ ] Technical launch article

## Medium-Term (1-3 months)

### Features

- [ ] Real-time GPU availability
- [ ] Auto-scaling
- [ ] Spot/preemptible instance support
- [ ] Custom model hosting
- [ ] Streaming inference with SSE in `/v1/chat/completions`
- [ ] Multi-tenant RBAC
- [ ] Stripe billing integration
- [ ] Usage analytics
- [ ] Terraform provider
- [ ] CLI tool: `era deploy gpu h100 --region eu`

### Partnerships

- [ ] Yandex Cloud - official reseller agreement
- [ ] VK Cloud - agent/partner program
- [ ] Selectel - referral + reseller
- [ ] Alibaba Cloud - AI Catalyst grant
- [ ] GitHub Marketplace - verified app
- [ ] Vercel Integration - add-on marketplace

## Technical Debt

- [ ] Expand test coverage beyond current 9 tests
- [x] Add integration tests for auth-gated operational routes and cross-tenant access
- [ ] Add e2e tests for inference endpoint
- [ ] Add ESLint setup
- [ ] Add pre-commit hooks: lint + typecheck
- [ ] Fix remaining npm audit moderate warnings when a safe Next/PostCSS patch is available
- [ ] API rate limiting - persistent storage, currently in-memory
- [ ] Auth - persist users and API keys to PostgreSQL, currently in-memory
- [ ] BYOK - store encrypted key material in a proper secret store; current app stores only prefixes

## Decisions Pending

- [ ] Brand: `eracloud.pro` as main domain or `eraone` ecosystem umbrella?
- [ ] Pricing: SMB markup model vs fixed SaaS tiers vs usage-based?
- [ ] Legal: Georgia LLC partner contracts, terms of service, privacy policy
