import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { getTickets } from '../services/ticketService'
import { useAuth } from '../context/AuthContext'
import { getSystems } from '../services/systemService'

function timeAgo(dateString) {
  const date = new Date(dateString)
  const now  = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return Math.floor(diff/60) + 'm ago'
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago'
  return Math.floor(diff/86400) + 'd ago'
}

export default function TicketsPage() {
  const { orgId } = useAuth()
  const navigate  = useNavigate()

  const [tickets,        setTickets]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [statusFilter,   setStatusFilter]   = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [systems,      setSystems]      = useState([])
const [systemFilter, setSystemFilter] = useState('')

  useEffect(() => {
  loadSystems()
  loadTickets()
}, [statusFilter, systemFilter])

async function loadSystems() {
  const { data } = await getSystems()
  if (data) setSystems(data)
}

  async function loadTickets() {
    setLoading(true)
    const { data, error } = await getTickets({
  orgId,
  status:   statusFilter  || undefined,
  systemId: systemFilter  || undefined,
})
    if (error) setError(error.message)
    else setTickets(data || [])
    setLoading(false)
  }

  const filtered = tickets.filter(t => {
    const matchesSearch   = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = !severityFilter || t.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  return (
    <PageWrapper
      title="Tickets"
      subtitle="Log, track and resolve issues across your systems."
      actions={
        <Button onClick={() => navigate('/tickets/new')}>
          <Plus size={16} />
          New Ticket
        </Button>
      }
    >
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-steel" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-brand-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
          />
        </div>
        <select
  value={systemFilter}
  onChange={e => setSystemFilter(e.target.value)}
  className="text-sm border border-brand-divider rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
>
  <option value="">All Systems</option>
  {systems.map(s => (
    <option key={s.id} value={s.id}>{s.name}</option>
  ))}
</select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-brand-divider rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="on_hold">On Hold</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="text-sm border border-brand-divider rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue text-brand-navy"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-brand-divider overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-brand-steel text-sm animate-pulse">Loading tickets...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-brand-steel text-sm mb-4">No tickets found.</p>
            <Button onClick={() => navigate('/tickets/new')}>
              <Plus size={16} /> Log your first ticket
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-divider bg-brand-off-white">
                <th className="text-left px-6 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">System</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Severity</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Logged by</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {filtered.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => navigate('/tickets/' + ticket.id)}
                  className="hover:bg-brand-off-white cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-brand-navy">{ticket.title}</p>
                    {ticket.page_title && (
                      <p className="text-brand-steel text-xs mt-0.5">{ticket.page_title}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-brand-steel">{ticket.systems?.name || 'n/a'}</td>
                  <td className="px-4 py-4"><Badge value={ticket.type} variant="type" /></td>
                  <td className="px-4 py-4"><Badge value={ticket.severity} variant="severity" /></td>
                  <td className="px-4 py-4"><Badge value={ticket.status} variant="status" /></td>
                  <td className="px-4 py-4 text-brand-steel">{ticket.profiles?.full_name || 'n/a'}</td>
                  <td className="px-4 py-4 text-brand-steel">{timeAgo(ticket.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageWrapper>
  )
}
