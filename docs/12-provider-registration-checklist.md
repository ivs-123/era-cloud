# ERA Cloud: Provider Registration Checklist

## Brand Identity

**Primary domain:** `eracloud.pro` (registered, Cloudflare DNS)
**Email for registrations:** `dev@eracloud.pro`
**Company:** Georgia LLC (International Company, 5% tax)
**Name on accounts:** "ERA Cloud" or "ERA Cloud / eraone"

---

## Tier 1 — Instant (API key on signup, 5 min each)

| # | Provider | URL | What you get | Price model |
|---|----------|-----|-------------|-------------|
| 1 | **DeepInfra** | deepinfra.com | Inference API: Llama, DeepSeek, Qwen, Whisper, SD | $0.06–0.55/1M tokens |
| 2 | **Groq** | console.groq.com | LPU inference: Llama, Mixtral, DeepSeek at 500+ tok/s | $0.05–0.59/1M tokens |
| 3 | **Together AI** | together.ai | Inference: Llama 405B, Mixtral, Flux image gen | $0.15–1.80/1M tokens |
| 4 | **Fireworks AI** | fireworks.ai | Inference: Llama, Mixtral, Qwen, SD 3.5 | $0.30–0.50/1M tokens |
| 5 | **Lepton AI** | lepton.ai | Inference: Llama, Mixtral, DeepSeek | $0.18–0.55/1M tokens |

**Action:** Register on all 5. Each gives free credits ($5–25). Total: ~30 min.
**Value:** Live inference routing across 5 providers immediately.

## Tier 2 — Quick GPU (account + small deposit, 15–30 min each)

| # | Provider | URL | What you get | Price model |
|---|----------|-----|-------------|-------------|
| 6 | **Thunder Compute** | thundercompute.com | GPU: A100, H100, L40S (cheapest GPU cloud) | $0.78–2.49/h |
| 7 | **Vast.ai** | vast.ai | GPU marketplace: H100 from $1.30/h, A100 from $0.55/h | P2P market |
| 8 | **RunPod** | runpod.io | GPU: H100, A100, RTX 4090, serverless vLLM | $0.44–1.99/h |

**Action:** Create accounts. Vast.ai needs $10 deposit. Thunder has credit match.
**Value:** Real GPU server provisioning on 3 providers.

## Tier 3 — European Cloud (verification needed, 1–3 days)

| # | Provider | URL | What you get | Notes |
|---|----------|-----|-------------|-------|
| 9 | **Hetzner** | hetzner.com/cloud | GPU: H100, A100, L40S + cheap CPU nodes | Needs ID verification, Georgia LLC works |
| 10 | **OVHcloud** | ovhcloud.com | GPU: H100, A100, L40S + bare metal | Georgia entity OK |

**Action:** Register with Georgia LLC docs. May take 1–2 days for verification.

## Tier 4 — Russian Cloud (partner agreements)

| # | Provider | URL | Partner program | 
|---|----------|-----|----------------|
| 11 | **Yandex Cloud** | cloud.yandex.ru | Tech partnership → reseller |
| 12 | **VK Cloud** | mcs.mail.ru | Agent/Reseller, up to 35% margin |
| 13 | **Cloud.ru** | cloud.ru | ISV co-sell program |
| 14 | **Selectel** | selectel.ru | Referral + reseller |
| 15 | **SberCloud** | sbercloud.ru | Enterprise GPU |

**Action:** Start with Yandex Cloud (you mentioned partner status). Rest follow.

## Tier 5 — Big Cloud (grant applications, weeks)

| # | Provider | URL | Grant program | Amount |
|---|----------|-----|---------------|--------|
| 16 | **AWS** | aws.amazon.com | Activate | up to $100K |
| 17 | **GCP** | cloud.google.com | Startups AI track | up to $350K |
| 18 | **Alibaba** | alibabacloud.com | AI Catalyst | up to $120K |
| 19 | **Azure** | azure.microsoft.com | Startup Founders Hub | up to $150K |
| 20 | **Oracle** | oracle.com/cloud | OPN partner | credits |

**Action:** Apply from Georgia LLC with `eracloud.pro` domain email. Need pitch deck.

## Tier 6 — CDN / Edge (instant)

| # | Provider | URL | What you get |
|---|----------|-----|-------------|
| 21 | **Cloudflare** | cloudflare.com | Edge workers, AI Gateway, R2, D1 (eracloud.pro already on CF) |

**Action:** Already using Cloudflare for DNS. Enable Workers for edge routing.

---

## Priority Order (this week)

```
Day 1: DeepInfra + Groq + Together AI (inference live in 15 min)
Day 2: Vast.ai + RunPod (GPU servers live)
Day 3: Thunder Compute test (already have token)
Day 4: Hetzner registration (Georgia LLC docs)
Week 2: Yandex Cloud partner agreement
Week 3-4: AWS/GCP grant applications
```

## Domain Strategy Note

If `eraone` is the ecosystem brand:
- `eraone.com` / `eraone.pro` — main company site
- `eracloud.pro` — cloud product
- `eraone.ai` — AI/inference product
- All share same Georgia LLC, same auth, same billing

Decision needed: register services as `ERA Cloud` or `eraone`?
