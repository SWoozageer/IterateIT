import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

const roles = ['org_admin', 'manager', 'tester', 'viewer']

export default function InviteUserModal({ onClose, onSuccess }) {
  const { orgId } = useAuth()

  const [form, setForm] = useState({
    email:     '',
    full_name: '',
    role:      'tester',
  })
  const [loading, setLoading]  = useState(false)
  const [error,   setError]    = useState('')
  const [success, setSuccess]  = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Create the user in Supabase Auth via admin invite
    // This sends them a magic link / invite email automatically
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(form.email, {
      data: {
        full_name: form.full_name,
        org_id:    orgId,
        role:      form.role,
      }
    })

    if (error) {
      // If admin invite not available, fall back to signUp
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email:    form.email,
        password: Math.random().toString(36).slice(-12),
        options: {
          data: {
            full_name: form.full_name,
            org_id:    orgId,
            role:      form.role,
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Create profile manually
      if (signUpData?.user) {
        await supabase.from('profiles').insert({
          id:        signUpData.user.id,
          org_id:    orgId,
          full_name: form.full_name,
          role:      form.role,
        })
      }
    } else if (data?.user) {
      // Create profile for invited user
      await supabase.from('profiles').insert({
        id:        data.user.id,
        org_id:    orgId,
        full_name: form.full_name,
        role:      form.role,
      })
    }

    setSuccess(`${form.full_name} has been invited successfully.`)
    setLoading(false)
    setTimeout(onSuccess, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-divider">
          <h3 className="font-display text-lg font-extrabold text-brand-navy">
            Invite User
          </h3>
          <button onClick={onClose} className="text-brand-steel hover:text-brand-navy transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
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

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Inviting...' : 'Send Invite'}
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
