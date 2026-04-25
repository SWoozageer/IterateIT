import { useState, useEffect } from 'react'
import { UserPlus, Shield, UserX, UserCheck } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import { getOrgUsers, updateUserRole, deactivateUser, reactivateUser } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import InviteUserModal from '../components/auth/InviteUserModal'

const roles = ['super_admin', 'org_admin', 'manager', 'tester', 'viewer']

function RoleBadge({ role }) {
  const colours = {
    super_admin: 'bg-purple-100 text-purple-700',
    org_admin:   'bg-blue-100 text-blue-700',
    manager:     'bg-indigo-100 text-indigo-700',
    tester:      'bg-green-100 text-green-700',
    viewer:      'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colours[role] || 'bg-gray-100 text-gray-600'}`}>
      {role?.replace('_', ' ')}
    </span>
  )
}

export default function UsersPage() {
  const { user: currentUser, role: currentRole } = useAuth()

  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [showInvite,  setShowInvite]  = useState(false)
  const [updating,    setUpdating]    = useState(null)

  const canManage = ['super_admin', 'org_admin'].includes(currentRole)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data, error } = await getOrgUsers()
    if (error) setError(error.message)
    else setUsers(data || [])
    setLoading(false)
  }

  async function handleRoleChange(userId, newRole) {
    setUpdating(userId)
    const { error } = await updateUserRole(userId, newRole)
    if (error) setError(error.message)
    else await loadUsers()
    setUpdating(null)
  }

  async function handleToggleActive(userId, isActive) {
    setUpdating(userId)
    const { error } = isActive
      ? await deactivateUser(userId)
      : await reactivateUser(userId)
    if (error) setError(error.message)
    else await loadUsers()
    setUpdating(null)
  }

  return (
    <PageWrapper
      title="Users"
      subtitle="Manage who has access to your organisation."
      actions={
        canManage && (
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus size={16} />
            Invite User
          </Button>
        )
      }
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-brand-divider overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-brand-steel text-sm animate-pulse">
            Loading users...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-off-white border-b border-brand-divider">
                <th className="text-left px-6 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Status</th>
                {canManage && (
                  <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {users.map(u => (
                <tr key={u.id} className={`${!u.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-brand-navy">
                          {u.full_name}
                          {u.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-brand-steel">(you)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {canManage && u.id !== currentUser?.id ? (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id}
                        className="text-sm border border-brand-divider rounded px-2 py-1 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={u.role} />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-4">
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          disabled={updating === u.id}
                          className="flex items-center gap-1.5 text-xs text-brand-steel hover:text-brand-navy transition-colors disabled:opacity-50"
                        >
                          {u.is_active ? (
                            <><UserX size={14} /> Deactivate</>
                          ) : (
                            <><UserCheck size={14} /> Reactivate</>
                          )}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteUserModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => { setShowInvite(false); loadUsers() }}
        />
      )}
    </PageWrapper>
  )
}
