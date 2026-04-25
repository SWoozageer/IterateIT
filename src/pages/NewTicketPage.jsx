import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import { createTicket } from '../services/ticketService'
import { getSystems } from '../services/systemService'
import { useAuth } from '../context/AuthContext'

export default function NewTicketPage() {
  const { user, orgId } = useAuth()
  const navigate = useNavigate()

  const [systems,  setSystems]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const [form, setForm] = useState({
    title:       '',
    description: '',
    type:        'enhancement',
    severity:    'medium',
    system_id:   '',
  })

  useEffect(() => {
    loadSystems()
  }, [])

  async function loadSystems() {
    const { data } = await getSystems()
    if (data) {
      setSystems(data)
      // Auto-select first system if only one exists
      if (data.length === 1) setForm(f => ({ ...f, system_id: data[0].id }))
    }
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.system_id) {
      setError('Please select a system.')
      return
    }

    setLoading(true)

    const { data, error } = await createTicket({
      ...form,
      org_id:     orgId,
      created_by: user.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate(`/tickets/${data.id}`)
    }
  }

  return (
    <PageWrapper
      title="New Ticket"
      subtitle="Log a new issue, enhancement, or question."
    >
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg border border-brand-divider p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* System */}
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                System <span className="text-red-500">*</span>
              </label>
              <select
                name="system_id"
                value={form.system_id}
                onChange={handleChange}
                required
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">Select a system...</option>
                {systems.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Brief summary of the issue or enhancement"
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the issue in detail — steps to reproduce, expected vs actual behaviour, etc."
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
              />
            </div>

            {/* Type + Severity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-navy mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="enhancement">Enhancement</option>
                  <option value="bug">Bug</option>
                  <option value="question">Question</option>
                  <option value="change_request">Change Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-navy mb-1">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                  className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/tickets')}
              >
                Cancel
              </Button>
            </div>

          </form>
        </div>
      </div>
    </PageWrapper>
  )
}