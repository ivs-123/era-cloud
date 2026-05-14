# ERA Cloud: Own GPU Virtualization Technical Roadmap

## What ThunderCompute Proved

ThunderCompute split GPU access from full-server rental through a proprietary network protocol and scheduler.

Core idea:

- GPU time sharing: multiple workloads share one physical GPU through slices or time windows.
- Preemption: prototyping workloads can pause when production jobs need priority.
- Network GPU access: workloads can reach GPU capacity over the network, not only local PCIe.
- Per-second billing: tenants pay for active GPU time instead of full idle hours.

Result:

- Better utilization.
- Lower entry price.
- Higher gross margin when capacity is owned or leased efficiently.

## Phase 0: Zero Hardware

What ERA Cloud can build before owning GPUs:

- Timeshare billing model using usage events.
- Preemption and resume API.
- Prototyping tier pricing.
- GPU-time cost estimator.
- Provider abstraction that can later route to own capacity.

## Phase 1: Orchestrator On Rented Metal

Goal:

- Rent 1-2 bare-metal A100/H100 servers and operate a scheduler on top.

Technical stack:

```text
K3s
NVIDIA GPU Operator
MIG partitioning
Custom scheduler
Prometheus/OpenTelemetry
ERA billing integration
```

Expected cost:

- Around $2K/month for early rented-metal experiments.

Milestones:

- Provision rented GPU metal.
- Install K3s and NVIDIA GPU Operator.
- Enable MIG where supported.
- Build scheduler that assigns GPU slices by workload priority.
- Track usage per tenant and workload.

## Phase 2: Own Bare Metal

Goal:

- Buy or finance A100/H100 servers and colocate them.

Architecture options:

- NVIDIA MIG for physical slicing.
- NVIDIA vGPU for VM-level isolation.
- rCUDA or custom GPU proxy for network GPU access.
- gRPC/HTTP2 control plane for scheduling and billing events.

Economics:

| Config | Approx Cost | Revenue Potential | Margin |
| --- | --- | --- | --- |
| 1 A100 server | $1,500/mo colo-style cost | $4K-6K/mo | 62-75% |
| 4 A100 servers | $6K/mo | $20K-30K/mo | 70-80% |
| 16 H100 cluster | $40K/mo | $150K-200K/mo | 73-80% |

## Phase 3: Production Scale

Capabilities:

- Multi-region GPU capacity.
- Spot market for GPU time.
- Provider overflow routing.
- Own-capacity-first routing when margin is better.
- Distributed training support later.

## Strategic Rule

Do not buy hardware before demand is proven.

ERA Cloud should first validate:

- demand by GPU profile
- price sensitivity
- provider reliability gaps
- usage patterns
- customer willingness to pay for unified billing and failover

Then buy or lease capacity only where the control plane already shows reliable demand.
