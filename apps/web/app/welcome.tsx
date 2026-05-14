"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth.js";
import { API_BASE } from "./api-client.js";

export default function WelcomePage() {
  const auth = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleRegister = async (event_: React.FormEvent) => {
    event_.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_name: tenantName, email, password })
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      const d = await r.json();
      setApiKey(d.data.api_key);
      localStorage.setItem("era_auth", JSON.stringify({
        token: d.data.token,
        tenantId: d.data.tenant_id,
        userId: d.data.user_id,
        role: d.data.role
      }));
      auth.login(email, password).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
    setLoading(false);
  };

  const handleLogin = async (event_: React.FormEvent) => {
    event_.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.login(loginEmail, loginPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
    setLoading(false);
  };

  if (apiKey) {
    return <OnboardingScreen apiKey={apiKey} />;
  }

  return (
    <div style={pageStyle}>
      <header style={{ padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: "white" }}>ERA Cloud</span>
        <span style={{ color: "#a9b8ae", fontSize: 14 }}>eracloud.pro</span>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 700, marginBottom: 40 }}>
          <p style={eyebrowStyle}>ONE PLATFORM. 40+ CLOUDS. ZERO COMPLEXITY.</p>
          <h1 style={{ fontSize: 48, margin: "12px 0", color: "white", lineHeight: 1.15 }}>
            GPU servers,<br />any provider, one click
          </h1>
          <p style={{ fontSize: 18, color: "#a9b8ae", lineHeight: 1.6, marginTop: 16 }}>
            A100 · H100 · L40S · RTX 4090 across AWS, GCP, Azure, Yandex,
            Hetzner, Alibaba, Thunder Compute and 30+ more.
            <strong style={{ color: "white" }}> One dashboard. One bill. Zero vendor lock-in.</strong>
          </p>
        </div>

        <div style={{ ...stepsRowStyle, marginBottom: 40 }}>
          <Feature icon="🖥" title="GPU Servers" desc="H100 from $1.30/h. A100 from $0.55/h. 40+ providers." />
          <Feature icon="⚡" title="One Click" desc="Pick GPU, pick region. We provision on the cheapest provider." />
          <Feature icon="💰" title="One Bill" desc="All your cloud servers, one invoice. Save up to 70% vs direct." />
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10, padding: "24px 28px", maxWidth: 700, marginBottom: 40, textAlign: "left"
        }}>
          <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px" }}>
            WHY OUR PRICES ARE THIS LOW
          </p>
          <h3 style={{ color: "white", fontSize: 20, margin: "0 0 12px" }}>
            You pay for GPU cycles, not idle servers
          </h3>
          <p style={{ color: "#a9b8ae", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Traditional clouds rent you the entire GPU — even when it's idle 85% of the time.
            ERA Cloud routes your workloads to providers like <strong style={{ color: "white" }}>Thunder Compute</strong>,
            who use <strong style={{ color: "white" }}>GPU virtualization and timeshare scheduling</strong> — 
            distributing unused cycles among users, achieving near 100% utilization.
            You pay only for active GPU time, with zero egress fees.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#4ade80", fontWeight: 700 }}>85% idle</span>
              <span style={{ color: "#6b7a6e" }}>→</span>
              <span style={{ color: "white", fontWeight: 600 }}>&lt;5% idle</span>
              <span style={{ color: "#a9b8ae", fontSize: 13 }}>via timeshare</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#4ade80", fontWeight: 700 }}>$3-4/h</span>
              <span style={{ color: "#6b7a6e" }}>→</span>
              <span style={{ color: "white", fontWeight: 600 }}>$0.78/h</span>
              <span style={{ color: "#a9b8ae", fontSize: 13 }}>A100 via Thunder</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#4ade80", fontWeight: 700 }}>Egress fees</span>
              <span style={{ color: "#6b7a6e" }}>→</span>
              <span style={{ color: "white", fontWeight: 600 }}>$0</span>
              <span style={{ color: "#a9b8ae", fontSize: 13 }}>included</span>
            </div>
          </div>
        </div>

        <div style={stepsRowStyle}>
          <Step number="1" title="Sign up" desc="Create account, get API key instantly" />
          <Step number="2" title="Pick GPU" desc="Choose H100, A100, L40S — any region" />
          <Step number="3" title="Deploy" desc="Server provisions in seconds. Stop anytime." />
        </div>

        <PricingPreview />

        <div style={{ marginTop: 48, maxWidth: 700, textAlign: "center" }}>
          <p style={eyebrowStyle}>ALREADY ON AWS, GCP, OR YANDEX?</p>
          <h2 style={{ fontSize: 28, margin: "8px 0", color: "white" }}>
            Save 30–50% without switching
          </h2>
          <p style={{ color: "#a9b8ae", fontSize: 15, lineHeight: 1.6, marginTop: 8 }}>
            Bring your own keys. ERA Cloud monitors pricing across your existing providers,
            auto-switches to cheaper regions and reserved instances.
            You keep your cloud. We optimize your bill.
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <div style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "16px 20px", minWidth: 200
            }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>BYOK</div>
              <div style={{ color: "#a9b8ae", fontSize: 13 }}>Your AWS/GCP key. Our optimization. Fixed SaaS fee.</div>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "16px 20px", minWidth: 200
            }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Hybrid</div>
              <div style={{ color: "#a9b8ae", fontSize: 13 }}>Keep critical workloads on your cloud. Burst to 40+ cheaper providers via ERA.</div>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "16px 20px", minWidth: 200
            }}>
              <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Cost Dashboard</div>
              <div style={{ color: "#a9b8ae", fontSize: 13 }}>One view: AWS vs Hetzner vs Yandex. Move workloads with one click.</div>
            </div>
          </div>
        </div>

        <div style={{ width: 400, background: "white", borderRadius: 12, padding: 32, marginTop: 40, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          {mode === "register" ? (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>Deploy your first GPU server</h2>
              <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: 14 }}>Free account. No credit card.</p>
              {error ? <div style={errStyle}>{error}</div> : null}
              <input style={inputStyle} type="text" placeholder="Company name" value={tenantName} onChange={e => setTenantName(e.target.value)} required minLength={2} />
              <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input style={inputStyle} type="password" placeholder="Password (min 8 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              <button type="submit" disabled={loading} style={btnStyle}>{loading ? "Creating..." : "Create free account"}</button>
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", margin: 0 }}>
                Already have an account?{" "}
                <a href="#" onClick={e => { e.preventDefault(); setMode("login"); setError(""); }} style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>Welcome back</h2>
              {error ? <div style={errStyle}>{error}</div> : null}
              <input style={inputStyle} type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              <input style={inputStyle} type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              <button type="submit" disabled={loading} style={btnStyle}>{loading ? "Signing in..." : "Sign in"}</button>
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", margin: 0 }}>
                New to ERA Cloud?{" "}
                <a href="#" onClick={e => { e.preventDefault(); setMode("register"); setError(""); }} style={{ color: "var(--accent)", fontWeight: 600 }}>Create account</a>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontWeight: 700, fontSize: 18
      }}>
        {number}
      </div>
      <div>
        <div style={{ color: "white", fontWeight: 600, fontSize: 15 }}>{title}</div>
        <div style={{ color: "#a9b8ae", fontSize: 13 }}>{desc}</div>
      </div>
    </div>
  );
}

function PricingPreview() {
  const [prices, setPrices] = useState<Array<{ canonical_gpu: string; min_price: number; cheapest_provider: string; provider_count: number }>>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/benchmark/gpu`)
      .then(r => r.json())
      .then(d => setPrices((d.data ?? []).slice(0, 6)))
      .catch(() => {});
  }, []);

  if (prices.length === 0) return null;

  return (
    <div style={{ marginTop: 40, textAlign: "center" }}>
      <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>
        LIVE PRICING
      </p>
      <p style={{ color: "#a9b8ae", fontSize: 14, margin: "0 0 16px" }}>
        Real-time GPU prices across all connected providers
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {prices.map(p => (
          <div key={p.canonical_gpu} style={{
            background: "rgba(255,255,255,0.06)", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px",
            minWidth: 140, textAlign: "center"
          }}>
            <div style={{ color: "white", fontWeight: 700, fontFamily: "monospace", fontSize: 14, marginBottom: 4 }}>
              {p.canonical_gpu}
            </div>
            <div style={{ color: "#4ade80", fontSize: 20, fontWeight: 700 }}>
              ${p.min_price.toFixed(2)}<span style={{ fontSize: 13, color: "#a9b8ae" }}>/h</span>
            </div>
            <div style={{ color: "#a9b8ae", fontSize: 11, marginTop: 2 }}>
              from {p.cheapest_provider} · {p.provider_count} providers
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "18px 22px",
      border: "1px solid rgba(255,255,255,0.08)", minWidth: 180, textAlign: "center"
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</div>
      <div style={{ color: "#a9b8ae", fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function OnboardingScreen({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false);
  const codeExample = `# 1. Deploy GPU server (H100 on cheapest provider)
curl -X POST https://api.eracloud.pro/v1/providers/deploy \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "gpu_type": "h100",
    "num_gpus": 1,
    "region": "us-east",
    "template": "base"
  }'
# Server provisions in ~30 seconds. You get IP + SSH access.

# 2. Or use the dashboard: eracloud.pro → Instances → Deploy
# 3. Stop when done. Billed only for uptime.
# That's it. No AWS console. No GCP IAM. No Yandex CLI.`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={pageStyle}>
      <header style={{ padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: "white" }}>ERA Cloud</span>
        <a href="/dashboard" style={{ color: "#a9b8ae", fontSize: 14 }}>Dashboard →</a>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 640, marginBottom: 32 }}>
          <p style={eyebrowStyle}>YOU'RE IN — DEPLOY YOUR FIRST SERVER</p>
          <h1 style={{ fontSize: 40, margin: "12px 0", color: "white" }}>
            Step 2: Deploy GPU server
          </h1>
          <p style={{ fontSize: 17, color: "#a9b8ae", lineHeight: 1.6 }}>
            Your API key is ready. Deploy a GPU server on any provider,
            or use the dashboard. Same key, same bill.
          </p>
        </div>

        <div style={{ width: 620, position: "relative" }}>
          <div style={{
            background: "#0a1a14", borderRadius: 10, border: "1px solid #2a4a3a",
            padding: "24px", fontFamily: "'Fira Code', 'Consolas', monospace",
            fontSize: 13, lineHeight: 1.7, color: "#8bd4a3", overflowX: "auto",
            position: "relative"
          }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              <code>{codeExample}</code>
            </pre>
          </div>
          <button
            onClick={copyCode}
            style={{
              position: "absolute", top: 12, right: 12,
              background: copied ? "var(--accent)" : "rgba(255,255,255,0.1)",
              color: "white", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6, padding: "6px 14px", cursor: "pointer",
              font: "inherit", fontSize: 13
            }}
          >
            {copied ? "Copied!" : "Copy code"}
          </button>
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <p style={{ color: "#a9b8ae", fontSize: 14, margin: "0 0 12px" }}>
            Step 3: Server is ready. SSH in. Run your workload.
          </p>
          <div style={stepsRowStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a9b8ae", fontSize: 14 }}>
              <span style={{ color: "#4ade80", fontWeight: 700 }}>python app.py</span>
              <span>→</span>
              <span style={{ color: "white" }}>Response routed to cheapest provider automatically</span>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <a href="/dashboard" style={{
              background: "var(--accent)", color: "white", borderRadius: 8, padding: "14px 28px",
              fontWeight: 600, fontSize: 16, textDecoration: "none", display: "inline-block"
            }}>
              Go to Dashboard
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh", display: "flex", flexDirection: "column",
  background: "linear-gradient(160deg, #0c4a3a 0%, #0a1a14 50%, #17201b 100%)"
};

const eyebrowStyle: React.CSSProperties = {
  color: "#4ade80", fontSize: 12, fontWeight: 700, letterSpacing: 2,
  textTransform: "uppercase", margin: 0
};

const stepsRowStyle: React.CSSProperties = {
  display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center"
};

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--line)", borderRadius: 8, font: "inherit",
  fontSize: 15, padding: "12px 14px", outline: "none", width: "100%",
  boxSizing: "border-box"
};

const btnStyle: React.CSSProperties = {
  border: 0, borderRadius: 8, background: "var(--accent)", color: "white",
  cursor: "pointer", font: "inherit", fontWeight: 600, padding: "14px",
  fontSize: 16, marginTop: 4, width: "100%"
};

const errStyle: React.CSSProperties = {
  background: "#ffe8e8", color: "#c53030", padding: "10px 14px",
  borderRadius: 6, fontSize: 14
};
