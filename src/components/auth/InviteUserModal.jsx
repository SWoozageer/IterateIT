import { useState, useEffect } from 'react'
import { X, Monitor } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { getSystems } from '../../services/systemService'
import { setUserSystems } from '../../services/userService'
import Button from '../ui/Button'

const roles = ['org_admin', 'manager', 'tester', 'viewer']

export default function InviteUserModal({ onClose, onSuccess }) {
  const { orgId } = useAuth()

  const [form, setForm] = useState({ email: '', full_name: '', role: 'tester' })
  const [systems,        setSystems]        = useState([])
  const [selectedSystems, setSelectedSystems] = useState(new Set())
  const [loading,        setLoading]        = useState(false)
  const [loadingSystems, setLoadingSystems] = useState(true)
  const [error,          setError]          = useState('')
  const [success,        setSuccess]        = useState('')

  const isAdminRole = ['org_admin'].includes(form.role)

  useEffect(() => {
    getSystems().then(({ data }) => {
      setSystems(data || [])
      setLoadingSystems(false)
    })
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function toggleSystem(id) {
    setSelectedSystems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let userId = null

    // Try admin invite first (sends magic link email automatically)
    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(form.email, {
      data: { full_name: form.full_name, org_id: orgId, role: form.role }
    })

    if (inviteError) {
      // Fallback: regular signUp with random password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email:    form.email,
        password: Math.random().toString(36).slice(-12),
        options:  { data: { full_name: form.full_name, org_id: orgId, role: form.role } }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      userId = signUpData?.user?.id
    } else {
      userId = data?.user?.id
    }

    // Create profile record
    if (userId) {
      await supabase.from('profiles').insert({
        id:        userId,
        org_id:    orgId,
        full_name: form.full_name,
        role:      form.role,
      })

      // Assign systems (skip for admin roles — they see everything)
      if (!isAdminRole && selectedSystems.size > 0) {
        await setUserSystems(userId, [...selectedSystems])
      }
    }

    setSuccess(`${form.full_name} has been invited successfully.`)
    setLoading(false)
    setTimeout(onSuccess, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-divider flex-shrink-0">
          <h3 className="font-display text-lg font-extrabold text-brand-navy">
            Create User
          </h3>
          <button onClick={onClose} className="text-brand-steel hover:text-brand-navy transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded px-4 py-3 mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                placeholder="Jane Smith"
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="jane@company.com"
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* System access */}
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                System Access
              </label>

              {isAdminRole ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded px-3 py-2">
                  Org admin has access to all systems automatically.
                </div>
              ) : loadingSystems ? (
                <div className="text-sm text-brand-steel animate-pulse py-2">Loading systems…</div>
              ) : systems.length === 0 ? (
                <div className="text-sm text-brand-steel py-2">
                  No systems yet — create them in Settings first.
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto border border-brand-divider rounded-lg p-2">
                  {systems.map(s => (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-brand-off-white cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSystems.has(s.id)}
                        onChange={() => toggleSystem(s.id)}
                        className="w-4 h-4 accent-brand-blue"
                      />
                      <Monitor size={13} className="text-brand-steel flex-shrink-0" />
                      <span className="text-sm text-brand-navy">{s.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {!isAdminRole && selectedSystems.size === 0 && systems.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No systems selected — user won't see any system data until assigned.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create User'}
              </Button>
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
