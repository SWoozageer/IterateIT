import { useState, useEffect } from 'react'
import { X, Monitor } from 'lucide-react'
import { getSystems } from '../../services/systemService'
import { setUserSystems } from '../../services/userService'
import Button from '../ui/Button'

export default function ManageUserSystemsModal({ user, currentSystemIds, onClose, onSuccess }) {
  const [systems,   setSystems]   = useState([])
  const [selected,  setSelected]  = useState(new Set(currentSystemIds))
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const isAdminRole = ['super_admin', 'org_admin'].includes(user.role)

  useEffect(() => {
    getSystems().then(({ data }) => {
      setSystems(data || [])
      setLoading(false)
    })
  }, [])

  function toggleSystem(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const { error } = await setUserSystems(user.id, [...selected])
    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-divider">
          <div>
            <h3 className="font-display text-lg font-extrabold text-brand-navy">
              Manage System Access
            </h3>
            <p className="text-xs text-brand-steel mt-0.5">{user.full_name}</p>
          </div>
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

          {isAdminRole ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded px-4 py-3">
              Admin roles (<strong>{user.role.replace('_', ' ')}</strong>) have access to all systems automatically.
            </div>
          ) : loading ? (
            <div className="text-sm text-brand-steel animate-pulse py-4">Loading systems…</div>
          ) : systems.length === 0 ? (
            <div className="text-sm text-brand-steel py-4">
              No systems found. Create systems in Settings first.
            </div>
          ) : (
            <>
              <p className="text-sm text-brand-steel mb-3">
                Select which systems this user can access:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {systems.map(s => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-brand-divider hover:bg-brand-off-white cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleSystem(s.id)}
                      className="w-4 h-4 accent-brand-blue"
                    />
                    <Monitor size={14} className="text-brand-steel flex-shrink-0" />
                    <span className="text-sm font-medium text-brand-navy">{s.name}</span>
                  </label>
                ))}
              </div>
              {selected.size === 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  No systems selected — this user won't have access to any system data.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isAdminRole && (
          <div className="flex gap-3 px-6 pb-5">
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? 'Saving…' : 'Save Access'}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}
        {isAdminRole && (
          <div className="flex px-6 pb-5">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  )
}
