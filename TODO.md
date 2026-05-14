# ERA Cloud - TODO

## Immediate (this week)

### Deployment

- [ ] Cloudflare DNS: add CNAME `eracloud.pro` -> `ivs-123.github.io`
- [ ] Render: deploy API via `render.com/deploy?repo=https://github.com/ivs-123/era-cloud`
- [x] GitHub Pages: site live at `ivs-123.github.io/era-cloud`
- [x] GitHub Actions: typecheck, tests, build, and auto-deploy on every push
- [x] Render blueprint: API uses PGlite with persistent `/var/data` disk
- [x] Render health check: `/health` wired in blueprint
- [x] Domain: `eracloud.pro` CNAME set in GitHub Pages, waiting DNS

### Provider Tokens

- [ ] DeepInfra - register, get API key
- [ ] Groq - register, get API key
- [ ] Together AI - register, get API key
- [ ] Fireworks AI - register, get API key
- [ ] Vast.ai - register, deposit test balance
- [ ] RunPod - register
- [ ] Hetzner - register with Georgia LLC docs
- [ ] Yandex Cloud - start partner agreement
- [x] Thunder Compute - tokens available via tools

### Security And Persistence

- [x] Tenant isolation on all operational routes
- [x] scrypt passwords, no plaintext password storage
- [x] SHA-256 API key hashes
- [x] Auth middleware tenant-aware
- [x] User/API key persistence via store interface
- [x] Security tests
- [x] PostgreSQL migrations 003 BYOK, 004 relaxed FK, 005 auth tables
- [x] Postgres migrations test with PGlite
- [x] PGlite persistent local/Render-compatible storage driver

### E2E Verified

- [x] Register -> get JWT + API key
- [x] Sync providers -> capabilities loaded
- [x] Create workload -> cheapest routing
- [x] Record usage -> generate invoice
- [x] Benchmark API -> GPU price comparison
- [x] BYOK flow -> add key -> direct routing
- [x] Preempt/resume API -> prototyping mode
- [x] Rate limiting -> 401/403/429 responses

## Short-Term (2-4 weeks)

### Infrastructure

- [ ] Live PostgreSQL - validate PostgresStore via Render PG or Neon
- [ ] Monitoring - health check endpoint monitoring
- [ ] Git tag - release v0.3

### Product

- [ ] Pricing page - standalone `/pricing` with full GPU comparison
- [ ] Docs page - API reference with curl examples
- [ ] Status page - `status.eracloud.pro`
- [ ] Provider status live monitoring - auto health-check all adapters
- [ ] Dashboard: add real provider logos
- [ ] Dashboard: add provider detail page with specs and pricing
- [x] Landing page: price hero + timeshare section

### Growth

- [ ] LangChain/LiteLLM integration
- [ ] AWS Activate grant
- [ ] GCP Startup grant
- [ ] Product Hunt launch prep

## Medium-Term (1-3 months)

### Features

- [ ] Real-time GPU availability
- [ ] Auto-scaling
- [ ] Streaming inference with SSE in `/v1/chat/completions`
- [ ] Stripe billing integration
- [ ] Terraform provider
- [x] Prototyping mode - preemptible workloads at 50% discount

### Partnerships

- [ ] Yandex Cloud - official reseller agreement
- [ ] VK Cloud - agent/partner program
- [ ] GitHub Marketplace - verified app
- [ ] Vercel Integration - add-on marketplace

## Stage 2: Own GPU Virtualization

See `docs/13-gpu-virtualization-roadmap.md` for full plan.

### Phase 1: Orchestrator On Rented Metal

- [ ] Rent bare-metal A100 from Hetzner/Vultr
- [ ] K3s + NVIDIA GPU Operator + MIG partitioning
- [ ] Custom GPU timeshare scheduler
- [ ] Prototyping tier with preemption
- [ ] Per-second billing integration

### Phase 2: Own GPU Hardware

- [ ] A100/H100 servers in colocation
- [ ] rCUDA or custom GPU proxy
- [ ] Timeshare planning like ThunderCompute
- [ ] 62-80% margin model

### Phase 3: Production Scale

- [ ] Multiple datacenter locations
- [ ] Spot market for GPU time
- [ ] Own GPU virtualization protocol
- [ ] 80-90% margin model

## Current Project Counters

- 36 commits
- 12 tests
- 40 providers
- `eracloud.pro`
- Stage 1 almost complete
