import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageWrapper from '../components/layout/PageWrapper'
import Badge from '../components/ui/Badge'
import { getTickets } from '../services/ticketService'
import { getSystems } from '../services/systemService'
import { Ticket, CheckCircle, Clock, AlertCircle, Monitor } from 'lucide-react'

function timeAgo(dateString) {
  const date = new Date(dateString)
  const now  = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return Math.floor(diff/60) + 'm ago'
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago'
  return Math.floor(diff/86400) + 'd ago'
}

// ── Stat Card ────────────────────────────────
function StatCard({ icon: Icon, label, value, colour, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border-2 p-6 flex items-center gap-4 cursor-pointer transition-all ${
        active
          ? 'border-brand-blue shadow-lg shadow-brand-blue/10'
          : 'border-brand-divider hover:border-brand-blue/40 hover:shadow-md'
      }`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colour}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-brand-steel text-sm">{label}</p>
        <p className="font-display text-3xl font-extrabold text-brand-navy">{value}</p>
      </div>
      {active && (
        <div className="ml-auto">
          <span className="text-xs bg-brand-blue text-white px-2 py-1 rounded-full">
            Filtered
          </span>
        </div>
      )}
    </div>
  )
}

// ── System Card ──────────────────────────────
function SystemCard({ system, count, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
        active
          ? 'border-brand-blue shadow-lg shadow-brand-blue/10'
          : 'border-brand-divider hover:border-brand-blue/40 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
          <Monitor size={16} className="text-brand-blue" />
        </div>
        {active && (
          <span className="text-xs bg-brand-blue text-white px-2 py-0.5 rounded-full">
            Filtered
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-extrabold text-brand-navy">{count}</p>
      <p className="text-brand-steel text-xs mt-0.5 truncate">{system.name}</p>
      <p className="text-xs text-orange-500 font-medium mt-1">pending</p>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()

  const [tickets,       setTickets]       = useState([])
  const [systems,       setSystems]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [activeFilter,  setActiveFilter]  = useState(null) // { type: 'status'|'severity'|'system', value }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: ticketData }, { data: systemData }] = await Promise.all([
      getTickets(),
      getSystems(),
    ])
    if (ticketData) setTickets(ticketData)
    if (systemData) setSystems(systemData)
    setLoading(false)
  }

  // ── Stats ──────────────────────────────────
  const total      = tickets.length
  const inProgress = tickets.filter(t => t.status === 'in_progress').length
  const critical   = tickets.filter(t => t.severity === 'critical').length
  const today      = new Date().toDateString()
  const resolvedToday = tickets.filter(t =>
    t.status === 'resolved' && new Date(t.updated_at).toDateString() === today
  ).length

  // ── System counts (pending = not resolved/closed) ──
  const systemCounts = systems.map(s => ({
    system: s,
    count:  tickets.filter(t =>
      t.system_id === s.id &&
      !['resolved','closed'].includes(t.status)
    ).length
  })).filter(s => s.count > 0)

  // ── Filtered tickets for the table ──────────
  const filteredTickets = tickets.filter(t => {
    if (!activeFilter) return true
    if (activeFilter.type === 'status')   return t.status   === activeFilter.value
    if (activeFilter.type === 'severity') return t.severity === activeFilter.value
    if (activeFilter.type === 'system')   return t.system_id === activeFilter.value
    return true
  }).slice(0, 10)

  function toggleFilter(type, value) {
    if (activeFilter && activeFilter.type === type && activeFilter.value === value) {
      setActiveFilter(null) // click again to clear
    } else {
      setActiveFilter({ type, value })
    }
  }

  function getFilterLabel() {
    if (!activeFilter) return null
    if (activeFilter.type === 'status')   return 'Status: ' + activeFilter.value.replace(/_/g,' ')
    if (activeFilter.type === 'severity') return 'Severity: ' + activeFilter.value
    if (activeFilter.type === 'system') {
      var sys = systems.find(s => s.id === activeFilter.value)
      return 'System: ' + (sys ? sys.name : '')
    }
  }

  return (
    <PageWrapper
      title={'Welcome, ' + (profile?.full_name || 'there') + '!'}
      subtitle="Here's a summary of what's happening across your systems."
    >
      {/* ── Status Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Ticket}
          label="Total Tickets"
          value={loading ? '—' : total}
          colour="bg-brand-blue"
          active={activeFilter === null}
          onClick={() => setActiveFilter(null)}
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={loading ? '—' : inProgress}
          colour="bg-yellow-400"
          active={activeFilter?.type === 'status' && activeFilter?.value === 'in_progress'}
          onClick={() => toggleFilter('status', 'in_progress')}
        />
        <StatCard
          icon={AlertCircle}
          label="Critical"
          value={loading ? '—' : critical}
          colour="bg-red-500"
          active={activeFilter?.type === 'severity' && activeFilter?.value === 'critical'}
          onClick={() => toggleFilter('severity', 'critical')}
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved Today"
          value={loading ? '—' : resolvedToday}
          colour="bg-green-500"
          active={activeFilter?.type === 'status' && activeFilter?.value === 'resolved'}
          onClick={() => toggleFilter('status', 'resolved')}
        />
      </div>

      {/* ── System Cards ── */}
      {systemCounts.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-brand-steel uppercase tracking-wider mb-3">
            Pending by System
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {systemCounts.map(({ system, count }) => (
              <SystemCard
                key={system.id}
                system={system}
                count={count}
                active={activeFilter?.type === 'system' && activeFilter?.value === system.id}
                onClick={() => toggleFilter('system', system.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Filtered Tickets Table ── */}
      <div className="bg-white rounded-lg border border-brand-divider overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-divider flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg font-extrabold text-brand-navy">
              {activeFilter ? 'Filtered Tickets' : 'Recent Tickets'}
            </h3>
            {activeFilter && (
              <span className="text-xs bg-brand-blue/10 text-brand-blue px-2.5 py-1 rounded-full font-medium">
                {getFilterLabel()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Clear filter ✕
              </button>
            )}
            
              <Link
  to="/tickets"
  className="text-brand-blue text-sm hover:underline"
>
  View all
</Link>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-brand-steel text-sm animate-pulse">
            Loading...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-brand-steel text-sm">
            No tickets match this filter.
            <button
              onClick={() => setActiveFilter(null)}
              className="ml-2 text-brand-blue hover:underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-off-white border-b border-brand-divider">
                <th className="text-left px-6 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">System</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Severity</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {filteredTickets.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => window.location.href = '/tickets/' + ticket.id}
                  className="hover:bg-brand-off-white cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-brand-navy">{ticket.title}</td>
                  <td className="px-4 py-3 text-brand-steel">{ticket.systems?.name || '—'}</td>
                  <td className="px-4 py-3"><Badge value={ticket.severity} variant="severity" /></td>
                  <td className="px-4 py-3"><Badge value={ticket.status} variant="status" /></td>
                  <td className="px-4 py-3 text-brand-steel">{timeAgo(ticket.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  )
}
