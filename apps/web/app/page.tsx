"use client";

import { useEffect, useState } from "react";
import { api, type ApiProvider, type ApiTenant, type ApiWorkload } from "./api-client.js";

type Tab = "workloads" | "providers" | "tenants" | "billing";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("workloads");
  const [tenants, setTenants] = useState<ApiTenant[]>([]);
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [workloads, setWorkloads] = useState<ApiWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api.tenants.list().catch(() => [] as ApiTenant[]),
      api.providers.list().catch(() => [] as ApiProvider[]),
      api.workloads.list().catch(() => [] as ApiWorkload[])
    ])
      .then(([tenants, providers, workloads]) => {
        setTenants(tenants);
        setProviders(providers);
        setWorkloads(workloads);
      })
      .catch((error_) => setError(error_.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runningWorkloads = workloads.filter((wl) => wl.state === "running" || wl.state === "provisioning");
  const healthyProviders = providers.filter((provider) => provider.status === "healthy");
  const totalSpend = workloads.reduce((sum, wl) => {
    const provider = providers.find((provider) => provider.id === wl.selectedProviderId);
    const capability = provider?.capabilityDetails.find(
      (cap: { profile: string; region: string; priceValueUsd: number }) => cap.profile === wl.profile && cap.region === wl.region
    );
    return sum + (capability?.priceValueUsd ?? 0);
  }, 0);

  if (loading) {
    return (
      <main className="shell">
        <Sidebar tab={tab} setTab={setTab} />
        <section className="workspace">
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <Sidebar tab={tab} setTab={setTab} />
      <section className="workspace">
        {error ? (
          <div className="error-banner">
            <p>{error}</p>
            <button type="button" onClick={fetchData}>Retry</button>
          </div>
        ) : null}

        <header className="topbar">
          <div>
            <p className="eyebrow">ERA Cloud</p>
            <h2>{tab === "workloads" ? "Workloads" : tab === "providers" ? "Providers" : tab === "tenants" ? "Tenants" : "Billing"}</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" onClick={fetchData} className="btn-ghost">Refresh</button>
            {tab === "workloads" ? <CreateWorkloadForm tenants={tenants} providers={providers} onCreated={fetchData} /> : null}
            {tab === "providers" ? <CreateProviderForm onCreated={fetchData} /> : null}
            {tab === "tenants" ? <CreateTenantForm onCreated={fetchData} /> : null}
          </div>
        </header>

        <div className="metrics">
          <div>
            <span>Active workloads</span>
            <strong>{runningWorkloads.length}</strong>
          </div>
          <div>
            <span>Healthy providers</span>
            <strong>{healthyProviders.length} / {providers.length}</strong>
          </div>
          <div>
            <span>Est. hourly spend</span>
            <strong>${totalSpend.toFixed(2)}</strong>
          </div>
        </div>

        {tab === "workloads" ? (
          <WorkloadsTable workloads={workloads} providers={providers} onStopped={fetchData} />
        ) : tab === "providers" ? (
          <ProvidersTable providers={providers} onSynced={fetchData} />
        ) : tab === "billing" ? (
          <BillingPanel tenants={tenants} workloads={workloads} providers={providers} />
        ) : (
          <TenantsTable tenants={tenants} />
        )}
      </section>
    </main>
  );
}

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">ERA Cloud</p>
        <h1>Control plane</h1>
      </div>
      <nav>
        <a href="#" onClick={(event_) => { event_.preventDefault(); setTab("workloads"); }} className={tab === "workloads" ? "nav-active" : ""}>
          Workloads
        </a>
        <a href="#" onClick={(event_) => { event_.preventDefault(); setTab("providers"); }} className={tab === "providers" ? "nav-active" : ""}>
          Providers
        </a>
        <a href="#" onClick={(event_) => { event_.preventDefault(); setTab("tenants"); }} className={tab === "tenants" ? "nav-active" : ""}>
          Tenants
        </a>
        <a href="#" onClick={(event_) => { event_.preventDefault(); setTab("billing"); }} className={tab === "billing" ? "nav-active" : ""}>
          Billing
        </a>
      </nav>
    </aside>
  );
}

function WorkloadsTable({ workloads, providers, onStopped }: { workloads: ApiWorkload[]; providers: ApiProvider[]; onStopped: () => void }) {
  const [stopping, setStopping] = useState<string | null>(null);

  const handleStop = async (id: string) => {
    setStopping(id);
    try {
      await api.workloads.stop(id);
    } catch {
      // Keep trying
    }
    setStopping(null);
    onStopped();
  };

  if (workloads.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No workloads yet. Create one to get started.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Profile</th>
          <th>Policy</th>
          <th>Provider</th>
          <th>Region</th>
          <th>State</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {workloads.map((wl) => {
          const provider = providers.find((provider) => provider.id === wl.selectedProviderId);
          return (
            <tr key={wl.id}>
              <td style={{ fontSize: 13, fontFamily: "monospace" }}>{wl.id}</td>
              <td>{wl.profile}</td>
              <td>{wl.routingPolicy}</td>
              <td>{provider?.name ?? wl.selectedProviderId}</td>
              <td>{wl.region}</td>
              <td>
                <span className={`state ${wl.state}`}>{wl.state}</span>
              </td>
              <td>
                {wl.state === "running" || wl.state === "provisioning" ? (
                  <button
                    type="button"
                    className="btn-sm btn-danger"
                    onClick={() => handleStop(wl.id)}
                    disabled={stopping === wl.id}
                  >
                    {stopping === wl.id ? "Stopping..." : "Stop"}
                  </button>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ProvidersTable({ providers, onSynced }: { providers: ApiProvider[]; onSynced: () => void }) {
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSync = async (name: string) => {
    setSyncing(name);
    try {
      await api.providers.sync(name);
    } catch {
      // Sync may fail if provider is not reachable
    }
    setSyncing(null);
    onSynced();
  };

  if (providers.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No providers registered.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Status</th>
          <th>Regions</th>
          <th>Capabilities</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {providers.map((provider) => (
          <tr key={provider.id}>
            <td style={{ fontWeight: 600 }}>{provider.name}</td>
            <td>{provider.type}</td>
            <td>
              <span className={`state ${provider.status}`}>{provider.status}</span>
            </td>
            <td>{provider.regions.join(", ")}</td>
            <td style={{ fontSize: 13 }}>{provider.capabilities.join(", ")}</td>
            <td>
              <button
                type="button"
                className="btn-sm btn-ghost"
                onClick={() => handleSync(provider.name)}
                disabled={syncing === provider.name}
              >
                {syncing === provider.name ? "Syncing..." : "Sync"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TenantsTable({ tenants }: { tenants: ApiTenant[] }) {
  if (tenants.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No tenants yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {tenants.map((tenant) => (
          <tr key={tenant.id}>
            <td style={{ fontSize: 13, fontFamily: "monospace" }}>{tenant.id}</td>
            <td style={{ fontWeight: 600 }}>{tenant.name}</td>
            <td>
              <span className={`state ${tenant.status}`}>{tenant.status}</span>
            </td>
            <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CreateTenantForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event_: React.FormEvent) => {
    event_.preventDefault();
    setSubmitting(true);
    try {
      await api.tenants.create(name);
      setName("");
      setOpen(false);
      onCreated();
    } catch {
      // Handle error
    }
    setSubmitting(false);
  };

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)}>Create tenant</button>;
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        type="text"
        placeholder="Tenant name"
        value={name}
        onChange={(event_) => setName(event_.target.value)}
        minLength={2}
        maxLength={120}
        required
      />
      <button type="submit" disabled={submitting || name.length < 2}>
        {submitting ? "Creating..." : "Save"}
      </button>
      <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}

function CreateProviderForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("server");
  const [regions, setRegions] = useState("us-east-1");
  const [capabilities, setCapabilities] = useState("gpu-h100,gpu-a100");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event_: React.FormEvent) => {
    event_.preventDefault();
    setSubmitting(true);
    try {
      await api.providers.create({
        name,
        type,
        regions: regions.split(",").map((s) => s.trim()),
        capabilities: capabilities.split(",").map((s) => s.trim())
      });
      setName("");
      setOpen(false);
      onCreated();
    } catch {
      // Handle error
    }
    setSubmitting(false);
  };

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)}>Register provider</button>;
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        type="text"
        placeholder="Provider name"
        value={name}
        onChange={(event_) => setName(event_.target.value)}
        required
      />
      <select value={type} onChange={(event_) => setType(event_.target.value)}>
        <option value="server">server</option>
        <option value="inference">inference</option>
      </select>
      <input
        type="text"
        placeholder="Regions (comma-separated)"
        value={regions}
        onChange={(event_) => setRegions(event_.target.value)}
      />
      <input
        type="text"
        placeholder="Capabilities (comma-separated)"
        value={capabilities}
        onChange={(event_) => setCapabilities(event_.target.value)}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save"}
      </button>
      <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}

function CreateWorkloadForm({ tenants, providers, onCreated }: { tenants: ApiTenant[]; providers: ApiProvider[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [kind, setKind] = useState("server");
  const [profile, setProfile] = useState("gpu-h100");
  const [region, setRegion] = useState("us-east-1");
  const [routingPolicy, setRoutingPolicy] = useState("balanced");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event_: React.FormEvent) => {
    event_.preventDefault();
    setSubmitting(true);
    try {
      await api.workloads.create({
        tenant_id: tenantId,
        kind,
        profile,
        region,
        routing_policy: routingPolicy
      });
      setOpen(false);
      onCreated();
    } catch {
      // Handle error
    }
    setSubmitting(false);
  };

  if (!open) {
    return <button type="button" onClick={() => setOpen(true)}>Create workload</button>;
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <select value={tenantId} onChange={(event_) => setTenantId(event_.target.value)}>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
        ))}
      </select>
      <select value={kind} onChange={(event_) => setKind(event_.target.value)}>
        <option value="server">server</option>
        <option value="inference">inference</option>
      </select>
      <input
        type="text"
        placeholder="Profile"
        value={profile}
        onChange={(event_) => setProfile(event_.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Region"
        value={region}
        onChange={(event_) => setRegion(event_.target.value)}
        required
      />
      <select value={routingPolicy} onChange={(event_) => setRoutingPolicy(event_.target.value)}>
        <option value="balanced">balanced</option>
        <option value="cheapest">cheapest</option>
        <option value="low-latency">low-latency</option>
      </select>
      <button type="submit" disabled={submitting || !tenantId}>
        {submitting ? "Creating..." : "Save"}
      </button>
      <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}

function BillingPanel({ tenants, workloads, providers }: { tenants: ApiTenant[]; workloads: ApiWorkload[]; providers: ApiProvider[] }) {
  const [selectedTenant, setSelectedTenant] = useState(tenants[0]?.id ?? "");
  const [estimate, setEstimate] = useState<{ dailyRateUsd: number; projectedMonthlyUsd: number; runningWorkloadCount: number } | null>(null);
  const [invoices, setInvoices] = useState<Array<{ id: string; status: string; totalUsd: number; currency: string; issuedAt?: string }>>([]);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const loadEstimate = async () => {
    if (!selectedTenant) return;
    setLoadingEstimate(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/billing/estimate?tenant_id=${encodeURIComponent(selectedTenant)}`);
      const result = await response.json();
      setEstimate(result.data);
    } catch {
      setEstimate(null);
    }
    setLoadingEstimate(false);
  };

  const generateInvoice = async () => {
    if (!selectedTenant) return;
    try {
      await fetch("http://localhost:4000/api/v1/billing/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: selectedTenant })
      });
      const response = await fetch(`http://localhost:4000/api/v1/billing/invoices?tenant_id=${encodeURIComponent(selectedTenant)}`);
      const result = await response.json();
      setInvoices(result.data ?? []);
    } catch {
      // Handle error
    }
  };

  const tenantWorkloads = workloads.filter((wl) => wl.tenantId === selectedTenant);
  const totalSpend = tenantWorkloads.reduce((sum, wl) => {
    const provider = providers.find((p) => p.id === wl.selectedProviderId);
    const cap = provider?.capabilityDetails.find(
      (c: { profile: string; region: string; priceValueUsd: number }) => c.profile === wl.profile && c.region === wl.region
    );
    return sum + (cap?.priceValueUsd ?? 0);
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} style={{ border: "1px solid var(--line)", borderRadius: 6, font: "inherit", padding: "8px 10px" }}>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button type="button" onClick={loadEstimate} disabled={loadingEstimate}>
          {loadingEstimate ? "Loading..." : "Get Estimate"}
        </button>
        <button type="button" className="btn-ghost" onClick={generateInvoice}>
          Generate Invoice
        </button>
      </div>

      <div className="metrics">
        <div>
          <span>Est. monthly</span>
          <strong>${estimate?.projectedMonthlyUsd?.toFixed(2) ?? totalSpend.toFixed(2)}</strong>
        </div>
        <div>
          <span>Daily rate</span>
          <strong>${estimate?.dailyRateUsd?.toFixed(2) ?? "0.00"}</strong>
        </div>
        <div>
          <span>Active workloads</span>
          <strong>{estimate?.runningWorkloadCount ?? tenantWorkloads.filter((wl) => wl.state === "running" || wl.state === "provisioning").length}</strong>
        </div>
      </div>

      {invoices.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Status</th>
              <th>Total</th>
              <th>Issued</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>{inv.id}</td>
                <td><span className={`state ${inv.status}`}>{inv.status}</span></td>
                <td>${inv.totalUsd.toFixed(2)} {inv.currency}</td>
                <td>{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "var(--muted)" }}>No invoices yet. Generate one to see billing data.</p>
      )}
    </div>
  );
}
