import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiPost } from "./api";
import LoginForm from "./components/LoginForm";
import { isLoggedIn, clearToken } from "./auth/token";
import "./App.css";

const statuses = ["", "Open", "InProgress", "Resolved"];
const severities = ["", "Low", "Medium", "High"];
const types = ["Incident", "Maintenance", "Alert"];
const sources = ["Manual", "Api"];

function buildEventsQuery({ status, severity }) {
  const params = new URLSearchParams();
  if (status) params.set("Status", status);
  if (severity) params.set("Severity", severity);
  const qs = params.toString();
  return qs ? `/api/Events?${qs}` : "/api/Events";
}

export default function App() {
  // ✅ Auth gate
  const [authed, setAuthed] = useState(isLoggedIn());

  useEffect(() => {
    // si api.js detecta 401 dispara auth:loggedOut
    const handler = () => setAuthed(false);
    window.addEventListener("auth:loggedOut", handler);
    return () => window.removeEventListener("auth:loggedOut", handler);
  }, []);

  // Si no está logueado, solo mostramos login
  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  // ✅ Tu dashboard actual, intacto
  const [metrics, setMetrics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ status: "", severity: "" });

  const [form, setForm] = useState({
    title: "",
    type: "Incident",
    severity: "Low",
    source: "Manual",
  });

  const eventsUrl = useMemo(() => buildEventsQuery(filters), [filters]);

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      const [m, e] = await Promise.all([apiGet("/api/Metrics"), apiGet(eventsUrl)]);
      setMetrics(m);
      setEvents(e);
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsUrl]);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await apiPost("/api/Events", form); // 🔐 ahora manda Bearer automáticamente
      setForm({ title: "", type: "Incident", severity: "Low", source: "Manual" });
      await refreshAll();
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  async function markResolved(id) {
    try {
      await apiPatch(`/api/Events/${id}/status`, { status: "Resolved" }); // 🔐 Bearer
      await refreshAll();
    } catch (err) {
      setError(err.message || "Error");
    }
  }

  function severityClass(sev) {
    if (sev === "High") return "red";
    if (sev === "Medium") return "yellow";
    if (sev === "Low") return "green";
    return "gray";
  }

  function statusClass(st) {
    if (st === "Resolved") return "green";
    if (st === "InProgress") return "yellow";
    return "gray";
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h2>Ops Dashboard</h2>
          <p className="subtitle">React + .NET 8 + PostgreSQL</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={refreshAll} disabled={loading}>
            Refresh
          </button>

          <button
            onClick={() => {
              clearToken();
              setAuthed(false);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      {/* KPIs */}
      <section className="kpis">
        <div className="card">
          <div className="kpi-title">Open Events</div>
          <div className="kpi-value">{metrics?.openCount ?? "—"}</div>
        </div>

        <div className="card">
          <div className="kpi-title">Resolved Today</div>
          <div className="kpi-value">{metrics?.resolvedToday ?? "—"}</div>
        </div>

        <div className="card">
          <div className="kpi-title">High Severity</div>
          <div className="kpi-value">{metrics?.bySeverity?.High ?? 0}</div>
        </div>
      </section>

      {/* Filters */}
      <section className="card form-section">
        <h4>Filters</h4>
        <div className="form-grid">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s || "Any Status"}
              </option>
            ))}
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
          >
            {severities.map((s) => (
              <option key={s} value={s}>
                {s || "Any Severity"}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Table */}
      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.title}</td>
                <td>{ev.type}</td>
                <td>
                  <span className={`badge ${severityClass(ev.severity)}`}>
                    {ev.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge ${statusClass(ev.status)}`}>
                    {ev.status}
                  </span>
                </td>
                <td>{new Date(ev.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="btn-primary"
                    disabled={ev.status === "Resolved"}
                    onClick={() => markResolved(ev.id)}
                  >
                    Resolve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Create */}
      <section className="card form-section">
        <h4>Create Event</h4>
        <form onSubmit={onCreate} className="form-grid">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />

          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <select
            value={form.severity}
            onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
          >
            {severities.filter(Boolean).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          >
            {sources.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <button className="btn-primary">Create</button>
        </form>
      </section>
    </div>
  );
}