# ERA Cloud — TODO

## Immediate (this week)

### Deployment
- [ ] **Cloudflare DNS:** add CNAME `eracloud.pro` → `ivs-123.github.io`
- [ ] **Render:** deploy API via `render.com/deploy?repo=https://github.com/ivs-123/era-cloud`
- [x] **GitHub Pages:** site live at `ivs-123.github.io/era-cloud`
- [x] **GitHub Actions:** auto-deploy on every push
- [x] **Domain:** `eracloud.pro` CNAME set in GitHub Pages (waiting DNS)

### Provider Tokens
- [ ] **DeepInfra** — register, get API key
- [ ] **Groq** — register, get API key
- [ ] **Together AI** — register, get API key
- [ ] **Fireworks AI** — register, get API key
- [ ] **Vast.ai** — register, deposit $10
- [ ] **RunPod** — register
- [ ] **Hetzner** — register with Georgia LLC docs
- [ ] **Yandex Cloud** — start partner agreement
- [x] **Thunder Compute** — tokens available via tools

### Security (ChatGPT audit)
- [x] Tenants isolation on all operational routes
- [x] scrypt passwords (no plaintext)
- [x] SHA-256 API key hashes
- [x] Auth middleware tenant-aware
- [x] User/API key persistence via store interface
- [x] Security tests (3 tests)
- [x] PostgreSQL migrations 003 (BYOK), 004 (relaxed FK), 005 (auth tables)
- [x] Postgres migrations test (PGLite)

### E2e Verified
- [x] Register → get JWT + API key
- [x] Sync providers → capabilities loaded
- [x] Create workload → cheapest routing
- [x] Record usage → generate invoice
- [x] Benchmark API → GPU price comparison
- [x] BYOK flow → add key → direct routing
- [x] Preempt/resume API → prototyping mode
- [x] Rate limiting → 401/403/429 responses

## Short-term (2-4 weeks)

### Infrastructure
- [ ] **PostgreSQL** — live DB via Render PG or Neon
- [ ] **PGLite** — persistent local storage driver (partial impl)
- [ ] **CI/CD** — add test run to GitHub Actions
- [ ] **Monitoring** — health check endpoint monitoring
- [ ] **Git tag** — release v0.3

### Product
- [ ] **Pricing page** — standalone `/pricing` with full GPU comparison
- [ ] **Docs page** — API reference with curl examples
- [ ] **Status page** — `status.eracloud.pro`
- [ ] **Provider status live monitoring** — auto health-check all adapters
- [ ] **Dashboard:** add real provider logos
- [ ] **Dashboard:** add provider detail page with specs + pricing
- [x] **Landing page:** price hero + timeshare section

### Growth
- [ ] **LangChain integration** — PR to LangChain/LiteLLM as official provider
- [ ] **AWS Activate grant** — apply from Georgia LLC (up to $100K)
- [ ] **GCP Startup grant** — apply from Georgia LLC (up to $350K)
- [ ] **Product Hunt** — prepare launch

## Medium-term (1-3 months)

### Features
- [ ] **Real-time GPU availability** — poll providers for instance counts
- [ ] **Auto-scaling** — spin up/down GPU servers based on demand
- [ ] **Streaming inference** — SSE support in `/v1/chat/completions`
- [ ] **Billing integration** — Stripe payments
- [ ] **Terraform provider** — IaC for ERA Cloud
- [x] **Prototyping mode** — preemptible workloads at 50% discount

### Partnerships
- [ ] **Yandex Cloud** — official reseller agreement
- [ ] **VK Cloud** — agent/partner program
- [ ] **GitHub Marketplace** — list as verified app
- [ ] **Vercel Integration** — add-on marketplace

## Stage 2: Own GPU Virtualization

See `docs/13-gpu-virtualization-roadmap.md` for full plan.

### Phase 1: Orchestrator on Rented Metal ($2K/mo, 1-2 months)
- [ ] Rent bare-metal A100 from Hetzner/Vultr
- [ ] K3s + NVIDIA GPU Operator + MIG partitioning
- [ ] Custom GPU timeshare scheduler (Go/TypeScript)
- [ ] Prototyping tier with preemption
- [ ] Per-second billing integration

### Phase 2: Own GPU Hardware ($20K upfront, 6-9 months)
- [ ] A100/H100 servers in colocation
- [ ] rCUDA or custom GPU proxy (gRPC)
- [ ] Timeshare planning (like ThunderCompute)
- [ ] 62-80% margins

### Phase 3: Production Scale (Year 2)
- [ ] Multiple datacenter locations
- [ ] Spot market for GPU time
- [ ] Own GPU virtualization (TCP protocol)
- [ ] 80-90% margins

---  
**36 commits** · **9 tests** · **40 providers** · **eracloud.pro** · **Stage 1 almost complete**
