# ERA Cloud: Own GPU Virtualization — Technical Roadmap

## What ThunderCompute Did

TC split GPU from server via a proprietary TCP protocol. Instead of "rent this entire A100 for $X/hour", they built:
- **GPU time-sharing:** multiple VMs/containers share one physical GPU, getting millisecond slices
- **Preemption:** prototyping workloads paused when production needs the GPU
- **Network GPU access:** GPU reachable over TCP, not just local PCIe
- **Per-second billing:** pay only for active GPU time

Result: utilization 85% idle → near 100%, prices 4-5x lower.

## Phase 1: No Own Hardware (Can start this month)

### 1.1 GPU Time-Share Orchestrator
Use existing GPU partitioning without custom hardware:
- **NVIDIA MIG** (A100/H100 support it natively) — splits GPU into isolated instances
- **NVIDIA vGPU** — virtual GPU for VMs
- **Kubernetes + GPU operator** — schedule pods with GPU fractions

Tech stack:
```
Kubernetes (K3s on rented bare metal)
  ├── NVIDIA GPU Operator
  ├── MIG partitioning (A100 → 7 slices of 10GB each)
  ├── Custom scheduler (Go/TypeScript) — decides who gets which slice
  └── Prometheus + billing integration (per-slice usage)
```

**Cost to start:** ~$2,000/mo — rent 1-2 A100 servers from Hetzner/Vultr, install K3s + GPU operator.

### 1.2 Preemption Logic
- Workloads tagged as `prototyping` (preemptible) or `production` (guaranteed)
- Prototyping workloads paused/snapshotted when production needs GPU
- State saved to NVMe, resumed when GPU is free
- Prototyping users pay 50% less, accept interruptions

### 1.3 Billing Integration
- Track GPU-milliseconds per tenant per workload
- Already have the billing engine — just add GPU-time metric
- Bill per GPU-second instead of per GPU-hour

## Phase 2: Own Bare Metal (Post-$100K revenue)

### 2.1 Hardware
- **GPUs:** A100-80GB or H100-80GB (PCIe or SXM)
- **Servers:** 2-4 GPUs per server, AMD EPYC or Intel Xeon
- **Networking:** 25/100GbE for GPU-to-GPU communication
- **Storage:** NVMe for fast preemption snapshots
- **Colocation:** Hetzner (EU), Equinix (US), DataLine/Selectel (RU)

### 2.2 Custom GPU Virtualization (like TC's TCP protocol)
Options:
- **rCUDA (Remote CUDA):** open-source, allows CUDA calls over TCP/IP. Mature, used in research.
- **NVIDIA GPUDirect RDMA:** GPU memory accessible over InfiniBand/RoCE. Fast but expensive.
- **Custom proxy (ERA Cloud's own):** intercept CUDA API calls, serialize, send over gRPC.

Recommended: Start with rCUDA + optimizations, build custom proxy later.

```
[Client Container]
     │ CUDA API calls
     ▼
[ERA GPU Proxy] — intercepts cudaMalloc, cudaMemcpy, kernel launches
     │ gRPC/HTTP2
     ▼
[GPU Server] — physical GPU runs the actual compute
     │
     ▼
[MIG Scheduler] — assigns GPU slices, enforces time limits, handles preemption
```

### 2.3 Economics
| Config | Cost/mo (colo) | Revenue potential | Margin |
|--------|---------------|-------------------|--------|
| 1× A100 server (2 GPUs) | $1,500 | $4,000-6,000 | 62-75% |
| 4× A100 cluster (8 GPUs) | $6,000 | $20,000-30,000 | 70-80% |
| 16× H100 cluster | $40,000 | $150,000-200,000 | 73-80% |

### 2.4 Timeline
| Milestone | When | Cost |
|-----------|------|------|
| GPU orchestrator on rented metal | Month 1-2 | $2K/mo |
| First paying prototyping customers | Month 3 | Revenue starts |
| Own GPUs in colocation | Month 6-9 | $20K upfront |
| Custom GPU proxy (gRPC) | Month 9-12 | Engineering |
| Full virtualization stack | Month 12-18 | Engineering |

## Phase 3: Production Scale (Year 2+)

- Multiple datacenter locations for low latency
- Spot market for GPU time (like Vast.ai but with our virtualization)
- Sell excess capacity back to the grid
- GPU-to-GPU communication for distributed training
- Automated GPU selection: MIG slice vs full GPU vs timeshare

## What We Can Build TODAY (Phase 0 — Zero Hardware)

Even without GPUs, we can build the **scheduler and billing** part:

1. **Timeshare billing model** — already have usage events + per-second tracking
2. **Preemption API** — `POST /v1/workloads/:id/preempt` + resume
3. **Prototyping tier pricing** — in provider capabilities, add mode: `prototyping` vs `production`
4. **GPU time estimator** — predict cost based on model + input size

This makes us ready to plug in real GPUs the moment we rent/buy them.
