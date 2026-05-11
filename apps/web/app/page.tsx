"use client";

import { useEffect, useState } from "react";
import { api, type ApiProvider, type ApiTenant, type ApiWorkload } from "./api-client.js";
import { useAuth } from "./auth.js";
import WelcomePage from "./welcome.js";

type Tab = "workloads" | "providers" | "tenants" | "billing" | "benchmark" | "keys";

export default function HomePage() {
  const auth = useAuth();
  const [tab, setTab] = useState<Tab>("workloads");
  const [tenants, setTenants] = useState<ApiTenant[]>([]);
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [workloads, setWorkloads] = useState<ApiWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = () => {
    if (!auth.isAuthenticated) return;
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
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return <WelcomePage />;
  }

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
            <h2>{tab === "workloads" ? "Workloads" : tab === "providers" ? "Providers" : tab === "tenants" ? "Tenants" : tab === "billing" ? "Billing" : tab === "benchmark" ? "GPU Benchmark" : "Keys (BYOK)"}</h2>
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
        ) : tab === "benchmark" ? (
          <BenchmarkPanel />
        ) : tab === "keys" ? (
          <KeysPanel tenants={tenants} />
        ) : (
          <TenantsTable tenants={tenants} />
        )}
      </section>
    </main>
  );
}

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const auth = useAuth();

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
        <a href="#" onClick={(event_) => { event_.preventDefault(); setTab("benchmark"); }} className={tab === "benchmark" ? "nav-active" : ""}>
          Benchmark
        </a>
        <a href="#" onClick={(event_) => { event_.preventDefault(); setTab("keys"); }} className={tab === "keys" ? "nav-active" : ""}>
          Keys (BYOK)
        </a>
      </nav>
      <div style={{ marginTop: "auto" }}>
        <p style={{ color: "#a9b8ae", fontSize: 13, margin: 0 }}>
          {auth.tenantId ? `Tenant: ${auth.tenantId.slice(0, 10)}...` : ""}
        </p>
        <button
          type="button"
          onClick={auth.logout}
          style={{ background: "transparent", border: "1px solid #5a6b5e", color: "#a9b8ae", fontSize: 13, marginTop: 8, padding: "6px 12px" }}
        >
          Logout
        </button>
      </div>
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
  const [byokMode, setByokMode] = useState(false);
  const [keyId, setKeyId] = useState("");
  const [keys, setKeys] = useState<Array<{ id: string; key_label: string; provider_name: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadKeys = async (tid: string) => {
    try {
      const r = await fetch(`http://localhost:4000/api/v1/keys?tenant_id=${encodeURIComponent(tid)}`);
      const d = await r.json();
      setKeys(d.data ?? []);
    } catch { setKeys([]); }
  };

  useEffect(() => { loadKeys(tenantId); }, [tenantId]);

  const handleSubmit = async (event_: React.FormEvent) => {
    event_.preventDefault();
    setSubmitting(true);
    try {
      await api.workloads.create({
        tenant_id: tenantId,
        kind,
        profile,
        region,
        routing_policy: routingPolicy,
        tenant_key_id: byokMode ? keyId : undefined
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
      <select value={tenantId} onChange={(event_) => { setTenantId(event_.target.value); loadKeys(event_.target.value); }}>
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
      {!byokMode ? (
        <select value={routingPolicy} onChange={(event_) => setRoutingPolicy(event_.target.value)}>
          <option value="balanced">balanced</option>
          <option value="cheapest">cheapest</option>
          <option value="low-latency">low-latency</option>
        </select>
      ) : null}
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, whiteSpace: "nowrap" }}>
        <input type="checkbox" checked={byokMode} onChange={(e) => setByokMode(e.target.checked)} />
        BYOK
      </label>
      {byokMode && keys.length > 0 ? (
        <select value={keyId} onChange={(e) => setKeyId(e.target.value)}>
          <option value="">Select key...</option>
          {keys.map((k) => (<option key={k.id} value={k.id}>{k.key_label} ({k.provider_name})</option>))}
        </select>
      ) : byokMode ? (
        <span style={{ color: "var(--warning)", fontSize: 13 }}>No keys configured</span>
      ) : null}
      <button type="submit" disabled={submitting || !tenantId || (byokMode && !keyId)}>
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

function BenchmarkPanel() {
  const [data, setData] = useState<Array<{
    canonical_gpu: string;
    provider_count: number;
    min_price: number;
    max_price: number;
    avg_price: number;
    cheapest_provider: string;
    cheapest_region: string;
    entries: Array<{ provider: string; region: string; price_per_hour: number }>;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGpu, setSelectedGpu] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/v1/benchmark/gpu")
      .then((r) => r.json())
      .then((result) => setData(result.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ color: "var(--muted)" }}>Loading benchmark data...</p>;
  }

  if (!data || data.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No benchmark data. Sync some providers first.</p>;
  }

  return (
    <div>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>
        Real-time GPU pricing across all connected providers. Click a row to see per-provider breakdown.
      </p>
      <table>
        <thead>
          <tr>
            <th>GPU</th>
            <th>Providers</th>
            <th>Min</th>
            <th>Avg</th>
            <th>Max</th>
            <th>Cheapest</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.canonical_gpu}
              onClick={() => setSelectedGpu(selectedGpu === row.canonical_gpu ? null : row.canonical_gpu)}
              style={{ cursor: "pointer" }}
            >
              <td style={{ fontWeight: 600, fontFamily: "monospace" }}>{row.canonical_gpu}</td>
              <td>{row.provider_count}</td>
              <td style={{ color: "var(--accent-strong)", fontWeight: 600 }}>
                ${row.min_price.toFixed(2)}/h
              </td>
              <td>${row.avg_price.toFixed(2)}/h</td>
              <td>${row.max_price.toFixed(2)}/h</td>
              <td>
                {row.cheapest_provider}
                <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: 6 }}>
                  ({row.cheapest_region})
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedGpu ? (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: "0 0 12px", fontFamily: "monospace" }}>
            {selectedGpu} — All providers
          </h3>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Region</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {data
                .find((d) => d.canonical_gpu === selectedGpu)
                ?.entries.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{e.provider}</td>
                    <td>{e.region}</td>
                    <td style={{ color: i === 0 ? "var(--accent-strong)" : "inherit", fontWeight: i === 0 ? 700 : 400 }}>
                      ${e.price_per_hour.toFixed(2)}/h
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function KeysPanel({ tenants }: { tenants: ApiTenant[] }) {
  const [selectedTenant, setSelectedTenant] = useState(tenants[0]?.id ?? "");
  const [keys, setKeys] = useState<Array<{ id: string; provider_name: string; key_label: string; key_prefix: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newProvider, setNewProvider] = useState("aws");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadKeys = async () => {
    if (!selectedTenant) return;
    setLoading(true);
    try {
      const r = await fetch(`http://localhost:4000/api/v1/keys?tenant_id=${encodeURIComponent(selectedTenant)}`);
      const data = await r.json();
      setKeys(data.data ?? []);
    } catch { setKeys([]); }
    setLoading(false);
  };

  useEffect(() => { loadKeys(); }, [selectedTenant]);

  const addKey = async (event_: React.FormEvent) => {
    event_.preventDefault();
    setSubmitting(true);
    try {
      await fetch("http://localhost:4000/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: selectedTenant,
          provider_name: newProvider,
          key_label: newLabel,
          key_value: newKeyValue
        })
      });
      setNewLabel(""); setNewKeyValue("");
      setShowAdd(false);
      loadKeys();
    } catch {}
    setSubmitting(false);
  };

  const removeKey = async (id: string) => {
    await fetch(`http://localhost:4000/api/v1/keys/${id}`, { method: "DELETE" });
    loadKeys();
  };

  const providers = ["aws", "gcp", "azure", "yandex-cloud", "vk-cloud", "cloud-ru", "selectel", "alibaba", "tencent", "oracle", "ibm"];

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <select value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} style={{ border: "1px solid var(--line)", borderRadius: 6, font: "inherit", padding: "8px 10px" }}>
          {tenants.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
        </select>
        <button type="button" onClick={() => setShowAdd(!showAdd)}>{showAdd ? "Cancel" : "Add Key"}</button>
      </div>

      {showAdd ? (
        <form onSubmit={addKey} className="inline-form" style={{ marginBottom: 20 }}>
          <input type="text" placeholder="Label (e.g. AWS Production)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} required />
          <select value={newProvider} onChange={(e) => setNewProvider(e.target.value)}>
            {providers.map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
          <input type="password" placeholder="API key / token" value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} required minLength={8} />
          <button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Key"}</button>
        </form>
      ) : null}

      {loading ? <p style={{ color: "var(--muted)" }}>Loading...</p> : keys.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No BYOK keys configured. Add your provider API keys to route workloads through your own accounts.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Key ID</th><th>Label</th><th>Provider</th><th>Prefix</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>{key.id}</td>
                <td style={{ fontWeight: 600 }}>{key.key_label}</td>
                <td>{key.provider_name}</td>
                <td style={{ fontFamily: "monospace", fontSize: 13, color: "var(--muted)" }}>{key.key_prefix}</td>
                <td>{new Date(key.created_at).toLocaleDateString()}</td>
                <td>
                  <button type="button" className="btn-sm btn-danger" onClick={() => removeKey(key.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 24, padding: 18, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 8 }}>
        <h3 style={{ margin: "0 0 8px" }}>How BYOK works</h3>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          <strong>Bring Your Own Key</strong> — you add your provider API keys. ERA Cloud routes workloads through your accounts.
          You pay the provider directly, and ERA Cloud charges a <strong>fixed SaaS subscription</strong> for routing optimization
          ($200-2,000/mo depending on volume). Zero markup on compute costs.
        </p>
      </div>
    </div>
  );
}
