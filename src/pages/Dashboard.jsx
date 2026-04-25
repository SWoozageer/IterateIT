import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageWrapper from '../components/layout/PageWrapper'
import Badge from '../components/ui/Badge'
import { getTickets } from '../services/ticketService'
import { Ticket, CheckCircle, Clock, AlertCircle } from 'lucide-react'

function StatCard({ icon: Icon, label, value, colour, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-brand-divider p-6 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colour}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-brand-steel text-sm">{label}</p>
        <p className="font-display text-3xl font-extrabold text-brand-navy">{value}</p>
      </div>
    </div>
  )
}

function timeAgo(dateString) {
  const date = new Date(dateString)
  const now  = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return Math.floor(diff/60) + 'm ago'
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago'
  return Math.floor(diff/86400) + 'd ago'
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [tickets,  setTickets]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { loadTickets() }, [])

  async function loadTickets() {
    const { data } = await getTickets()
    if (data) setTickets(data)
    setLoading(false)
  }

  // Calculate stats from live data
  const total      = tickets.length
  const inProgress = tickets.filter(t => t.status === 'in_progress').length
  const critical   = tickets.filter(t => t.severity === 'critical').length
  const today      = new Date().toDateString()
  const resolvedToday = tickets.filter(t =>
    t.status === 'resolved' && new Date(t.updated_at).toDateString() === today
  ).length

  const recent = tickets.slice(0, 8)

  return (
    <PageWrapper
      title={`Welcome, ${profile?.full_name || 'there'}!`}
      subtitle="Here's a summary of what's happening across your systems."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Ticket}
          label="Total Tickets"
          value={loading ? '—' : total}
          colour="bg-brand-blue"
          onClick={() => navigate('/tickets')}
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={loading ? '—' : inProgress}
          colour="bg-yellow-400"
          onClick={() => navigate('/tickets')}
        />
        <StatCard
          icon={AlertCircle}
          label="Critical"
          value={loading ? '—' : critical}
          colour="bg-red-500"
          onClick={() => navigate('/tickets')}
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved Today"
          value={loading ? '—' : resolvedToday}
          colour="bg-green-500"
        />
      </div>

      {/* Recent tickets */}
      <div className="bg-white rounded-lg border border-brand-divider overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-divider flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold text-brand-navy">
            Recent Tickets
          </h3>
          <button
            onClick={() => navigate('/tickets')}
            className="text-brand-blue text-sm hover:underline"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-brand-steel text-sm animate-pulse">
            Loading...
          </div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-brand-steel text-sm">
            No tickets yet. <button onClick={() => navigate('/tickets/new')} className="text-brand-blue hover:underline">Log your first ticket</button>
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
              {recent.map(ticket => (
                <tr
                  key={ticket.id}
                  onClick={() => navigate('/tickets/' + ticket.id)}
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
