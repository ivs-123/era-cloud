const workloadRows = [
  { name: "Assistant API", policy: "balanced", provider: "Mock Inference", spend: "$18.42", state: "running" },
  { name: "Batch Summaries", policy: "cheapest", provider: "Queued", spend: "$3.91", state: "provisioning" }
];

export default function HomePage() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">ERA Cloud</p>
          <h1>Control plane</h1>
        </div>
        <nav>
          <a href="/">Workloads</a>
          <a href="/">Providers</a>
          <a href="/">Usage</a>
          <a href="/">Billing</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">MVP dashboard</p>
            <h2>Workloads</h2>
          </div>
          <button type="button">Create workload</button>
        </header>

        <div className="metrics">
          <div>
            <span>Monthly spend</span>
            <strong>$22.33</strong>
          </div>
          <div>
            <span>Healthy providers</span>
            <strong>1 / 1</strong>
          </div>
          <div>
            <span>Routing success</span>
            <strong>99.2%</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Workload</th>
              <th>Policy</th>
              <th>Provider</th>
              <th>Spend</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {workloadRows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.policy}</td>
                <td>{row.provider}</td>
                <td>{row.spend}</td>
                <td>
                  <span className={`state ${row.state}`}>{row.state}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

