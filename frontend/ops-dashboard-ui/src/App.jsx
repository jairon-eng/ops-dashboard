import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPatch, apiPost } from './api'
import './App.css'

const statuses = ['', 'Open', 'InProgress', 'Resolved']
const severities = ['', 'Low', 'Medium', 'High']
const types = ['Incident', 'Maintenance', 'Alert']
const sources = ['Manual', 'Api']

function buildEventsQuery({ status, severity }) {
  const params = new URLSearchParams()
  if (status) params.set('Status', status)
  if (severity) params.set('Severity', severity)
  const qs = params.toString()
  return qs ? `/api/Events?${qs}` : '/api/Events'
}

export default function App() {
  const [metrics, setMetrics] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({ status: '', severity: '' })

  const [form, setForm] = useState({
    title: '',
    type: 'Incident',
    severity: 'Low',
    source: 'Manual',
  })

  const eventsUrl = useMemo(() => buildEventsQuery(filters), [filters])

  async function refreshAll() {
    setLoading(true)
    setError('')
    try {
      const [m, e] = await Promise.all([apiGet('/api/Metrics'), apiGet(eventsUrl)])
      setMetrics(m)
      setEvents(e)
    } catch (err) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsUrl])

  async function onCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await apiPost('/api/Events', form)
      setForm({ title: '', type: 'Incident', severity: 'Low', source: 'Manual' })
      await refreshAll()
    } catch (err) {
      setError(err.message || 'Error')
    }
  }

  async function markResolved(id) {
    setError('')
    try {
      await apiPatch(`/api/Events/${id}/status`, { status: 'Resolved' })
      await refreshAll()
    } catch (err) {
      setError(err.message || 'Error')
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Ops Dashboard</h2>
          <p style={{ marginTop: 6, opacity: 0.75 }}>React + .NET API</p>
        </div>
        <button onClick={refreshAll} disabled={loading}>Refresh</button>
      </header>

      {error && (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #f5a', borderRadius: 8 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Kpi title="Open events" value={metrics?.openCount ?? '—'} />
        <Kpi title="Resolved today" value={metrics?.resolvedToday ?? '—'} />
        <Kpi title="High severity" value={(metrics?.bySeverity?.High ?? 0)} />
      </section>

      <section style={{ marginTop: 18, padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
        <h4 style={{ marginTop: 0 }}>Filters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <label>
            Status
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              {statuses.map(s => <option key={s} value={s}>{s || 'Any'}</option>)}
            </select>
          </label>

          <label>
            Severity
            <select value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
              {severities.map(s => <option key={s} value={s}>{s || 'Any'}</option>)}
            </select>
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={() => setFilters({ status: '', severity: '' })}>Clear filters</button>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h4 style={{ marginBottom: 10 }}>Events</h4>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table width="100%" cellPadding="10" style={{ borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th align="left">Title</th>
                <th align="left">Type</th>
                <th align="left">Severity</th>
                <th align="left">Status</th>
                <th align="left">Created</th>
                <th align="left"></th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} style={{ borderTop: '1px solid #eee' }}>
                  <td>{ev.title}</td>
                  <td>{ev.type}</td>
                  <td>{ev.severity}</td>
                  <td>{ev.status}</td>
                  <td>{new Date(ev.createdAt).toLocaleString()}</td>
                  <td>
                    {ev.status !== 'Resolved' ? (
                      <button onClick={() => markResolved(ev.id)}>Resolve</button>
                    ) : (
                      <span style={{ opacity: 0.7 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan="6" style={{ opacity: 0.7 }}>No events</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 18, padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
        <h4 style={{ marginTop: 0 }}>Create event</h4>
        <form onSubmit={onCreate} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 10 }}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
            minLength={3}
            maxLength={120}
          />
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
            {severities.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit">Create</button>
        </form>
      </section>
    </div>
  )
}

function Kpi({ title, value }) {
  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.75 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  )
}
