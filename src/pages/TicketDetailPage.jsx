import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { getTicketById, updateTicket, addComment } from '../services/ticketService'
import { useAuth } from '../context/AuthContext'

function timeAgo(dateString) {
  const date = new Date(dateString)
  const now  = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return date.toLocaleDateString()
}

const statusOptions = ['open','in_progress','in_review','on_hold','resolved','closed']

export default function TicketDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user, role } = useAuth()

  const [ticket,      setTicket]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [comment,     setComment]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')

  const canChangeStatus = ['super_admin','org_admin','manager'].includes(role)

  useEffect(() => {
    loadTicket()
  }, [id])

  async function loadTicket() {
    setLoading(true)
    const { data, error } = await getTicketById(id)
    if (error) setError(error.message)
    else setTicket(data)
    setLoading(false)
  }

  async function handleStatusChange(e) {
    const { data } = await updateTicket(id, { status: e.target.value })
    if (data) setTicket(t => ({ ...t, status: data.status }))
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    const { data, error } = await addComment(id, user.id, comment)
    if (error) {
      setError(error.message)
    } else {
      setComment('')
      await loadTicket()
    }
    setSubmitting(false)
  }

  if (loading) return (
    <PageWrapper title="Ticket">
      <div className="text-brand-steel text-sm animate-pulse">Loading...</div>
    </PageWrapper>
  )

  if (!ticket) return (
    <PageWrapper title="Ticket">
      <div className="text-red-500 text-sm">Ticket not found.</div>
    </PageWrapper>
  )

  return (
    <PageWrapper
      title={`Ticket #${ticket.id.slice(0,8).toUpperCase()}`}
      subtitle={ticket.systems?.name}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-brand-steel hover:text-brand-navy text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Tickets
      </button>

      <div className="grid grid-cols-3 gap-6">

        {/* Main content */}
        <div className="col-span-2 space-y-6">

          {/* Ticket body */}
          <div className="bg-white rounded-lg border border-brand-divider p-6">
            <h2 className="font-display text-xl font-extrabold text-brand-navy mb-4">
              {ticket.title}
            </h2>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Badge value={ticket.status}   variant="status"   />
              <Badge value={ticket.severity} variant="severity" />
              <Badge value={ticket.type}     variant="type"     />
            </div>
            {ticket.description ? (
              <p className="text-brand-navy text-sm leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            ) : (
              <p className="text-brand-steel text-sm italic">No description provided.</p>
            )}

            {/* Page context from widget */}
            {ticket.page_url && (
              <div className="mt-4 pt-4 border-t border-brand-divider">
                <p className="text-xs text-brand-steel uppercase tracking-wider mb-2">Captured from</p>
                <p className="text-xs text-brand-navy font-medium">{ticket.page_title}</p>
                <p className="text-xs text-brand-steel">{ticket.page_url}</p>
                {ticket.menu_path && (
                  <p className="text-xs text-brand-steel mt-1">Path: {ticket.menu_path}</p>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-lg border border-brand-divider p-6">
            <h3 className="font-display text-lg font-extrabold text-brand-navy mb-4">
              Comments
            </h3>

            {ticket.ticket_comments?.length === 0 ? (
              <p className="text-brand-steel text-sm mb-4">No comments yet.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {ticket.ticket_comments?.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-brand-navy">
                          {c.profiles?.full_name}
                        </span>
                        <span className="text-xs text-brand-steel">
                          {timeAgo(c.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-brand-navy leading-relaxed whitespace-pre-wrap">
                        {c.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleComment} className="flex gap-3">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={2}
                placeholder="Add a comment..."
                className="flex-1 border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
              />
              <Button type="submit" disabled={submitting || !comment.trim()}>
                <Send size={14} />
                {submitting ? 'Sending...' : 'Send'}
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar meta */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-brand-divider p-5">
            <h4 className="text-xs font-semibold text-brand-steel uppercase tracking-wider mb-4">
              Details
            </h4>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-brand-steel text-xs mb-1">Status</p>
                {canChangeStatus ? (
                  <select
                    value={ticket.status}
                    onChange={handleStatusChange}
                    className="w-full border border-brand-divider rounded px-2 py-1.5 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                ) : (
                  <Badge value={ticket.status} variant="status" />
                )}
              </div>

              <div>
                <p className="text-brand-steel text-xs mb-1">Logged by</p>
                <p className="text-brand-navy font-medium">
                  {ticket.profiles?.full_name || '—'}
                </p>
              </div>

              <div>
                <p className="text-brand-steel text-xs mb-1">Assigned to</p>
                <p className="text-brand-navy font-medium">
                  {ticket.assignee?.full_name || 'Unassigned'}
                </p>
              </div>

              <div>
                <p className="text-brand-steel text-xs mb-1">System</p>
                <p className="text-brand-navy font-medium">{ticket.systems?.name}</p>
              </div>

              <div>
                <p className="text-brand-steel text-xs mb-1">Created</p>
                <p className="text-brand-navy font-medium">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-brand-steel text-xs mb-1">Last updated</p>
                <p className="text-brand-navy font-medium">
                  {new Date(ticket.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}