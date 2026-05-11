"use client";

import { useState } from "react";
import { useAuth } from "./auth.js";

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
      const r = await fetch("http://localhost:4000/api/v1/auth/register", {
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
        <div style={{ textAlign: "center", maxWidth: 640, marginBottom: 40 }}>
          <p style={eyebrowStyle}>ONE API KEY. 40 PROVIDERS. ZERO CONFIG.</p>
          <h1 style={{ fontSize: 48, margin: "12px 0", color: "white", lineHeight: 1.15 }}>
            AI inference at the<br />lowest possible price
          </h1>
          <p style={{ fontSize: 18, color: "#a9b8ae", lineHeight: 1.6, marginTop: 16 }}>
            Change one line of code. ERA Cloud auto-routes every request to the cheapest provider.
            Same OpenAI SDK. 7x cheaper.
          </p>
        </div>

        <div style={stepsRowStyle}>
          <Step number="1" title="Sign up" desc="Create account in 10 seconds" />
          <Step number="2" title="Copy 3 lines" desc="Paste into your Python/JS code" />
          <Step number="3" title="Deploy" desc="Requests auto-route to cheapest GPU" />
        </div>

        <div style={{ width: 400, background: "white", borderRadius: 12, padding: 32, marginTop: 40, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          {mode === "register" ? (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>Get started free</h2>
              <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: 14 }}>No credit card required</p>
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

function OnboardingScreen({ apiKey }: { apiKey: string }) {
  const [copied, setCopied] = useState(false);
  const codeExample = `from openai import OpenAI

client = OpenAI(
    api_key="${apiKey}",
    base_url="https://api.eracloud.pro/v1"
)
# That's it. Same OpenAI SDK, auto-routed to cheapest provider.
response = client.chat.completions.create(
    model="llama-3.3-70b",
    messages=[{"role": "user", "content": "Hello!"}]
)`;

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
          <p style={eyebrowStyle}>YOU'RE IN — 3 STEPS TO INFERENCE</p>
          <h1 style={{ fontSize: 40, margin: "12px 0", color: "white" }}>
            Step 2: Copy these 3 lines
          </h1>
          <p style={{ fontSize: 17, color: "#a9b8ae", lineHeight: 1.6 }}>
            Drop this into your Python project. That's the only change — ERA Cloud handles everything else.
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
            Step 3: Run it. That's it.
          </p>
          <div style={stepsRowStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a9b8ae", fontSize: 14 }}>
              <span style={{ color: "#4ade80", fontWeight: 700 }}>python app.py</span>
              <span>→</span>
              <span style={{ color: "white" }}>Response from Lepton AI ($0.32/1M tokens)</span>
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
