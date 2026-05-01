import { useState, useEffect, useMemo } from 'react'
import { UserPlus, Shield, UserX, UserCheck, Monitor } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import {
  getOrgUsers,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getAllUserSystems,
} from '../services/userService'
import { useAuth } from '../context/AuthContext'
import InviteUserModal from '../components/auth/InviteUserModal'
import ManageUserSystemsModal from '../components/users/ManageUserSystemsModal'

const roles = ['super_admin', 'org_admin', 'manager', 'tester', 'viewer']

const ROLE_COLOURS = {
  super_admin: 'bg-purple-100 text-purple-700',
  org_admin:   'bg-blue-100 text-blue-700',
  manager:     'bg-indigo-100 text-indigo-700',
  tester:      'bg-green-100 text-green-700',
  viewer:      'bg-gray-100 text-gray-600',
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLOURS[role] || 'bg-gray-100 text-gray-600'}`}>
      {role?.replace('_', ' ')}
    </span>
  )
}

function SystemBadges({ systemNames, isAdminRole }) {
  if (isAdminRole) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
        <Shield size={10} /> All systems
      </span>
    )
  }
  if (!systemNames || systemNames.length === 0) {
    return <span className="text-xs text-brand-steel italic">None</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {systemNames.map(name => (
        <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
          <Monitor size={9} />{name}
        </span>
      ))}
    </div>
  )
}

export default function UsersPage() {
  const { user: currentUser, role: currentRole } = useAuth()

  const [users,        setUsers]        = useState([])
  const [userSystems,  setUserSystems]  = useState([]) // flat list of {user_id, system_id, systems:{name}}
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [showInvite,   setShowInvite]   = useState(false)
  const [updating,     setUpdating]     = useState(null)
  const [managingUser, setManagingUser] = useState(null) // user object for ManageUserSystemsModal

  const canManage = ['super_admin', 'org_admin'].includes(currentRole)

  // Build a map: userId → [{system_id, name}]
  const systemsByUser = useMemo(() => {
    const map = {}
    for (const row of userSystems) {
      if (!map[row.user_id]) map[row.user_id] = []
      map[row.user_id].push({ id: row.system_id, name: row.systems?.name })
    }
    return map
  }, [userSystems])

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: usersData, error: usersErr }, { data: sysData }] = await Promise.all([
      getOrgUsers(),
      getAllUserSystems(),
    ])
    if (usersErr) setError(usersErr.message)
    else setUsers(usersData || [])
    setUserSystems(sysData || [])
    setLoading(false)
  }

  async function handleRoleChange(userId, newRole) {
    setUpdating(userId)
    const { error } = await updateUserRole(userId, newRole)
    if (error) setError(error.message)
    else await loadAll()
    setUpdating(null)
  }

  async function handleToggleActive(userId, isActive) {
    setUpdating(userId)
    const { error } = isActive ? await deactivateUser(userId) : await reactivateUser(userId)
    if (error) setError(error.message)
    else await loadAll()
    setUpdating(null)
  }

  return (
    <PageWrapper
      title="Users"
      subtitle="Manage who has access to your organisation and which systems they can use."
      actions={
        canManage && (
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus size={16} />
            Create User
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
            Loading users…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-off-white border-b border-brand-divider">
                <th className="text-left px-6 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Systems</th>
                <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Status</th>
                {canManage && (
                  <th className="text-left px-4 py-3 text-brand-steel font-semibold text-xs uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-divider">
              {users.map(u => {
                const isAdminRole  = ['super_admin', 'org_admin'].includes(u.role)
                const assignedSys  = systemsByUser[u.id] || []
                const systemNames  = assignedSys.map(s => s.name).filter(Boolean)

                return (
                  <tr key={u.id} className={!u.is_active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.full_name?.charAt(0) || '?'}
                        </div>
                        <p className="font-medium text-brand-navy">
                          {u.full_name}
                          {u.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-brand-steel">(you)</span>
                          )}
                        </p>
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

                    <td className="px-4 py-4 max-w-xs">
                      <SystemBadges systemNames={systemNames} isAdminRole={isAdminRole} />
                    </td>

                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {canManage && (
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {/* Manage systems button */}
                          <button
                            onClick={() => setManagingUser(u)}
                            className="flex items-center gap-1.5 text-xs text-brand-blue hover:text-brand-navy transition-colors"
                          >
                            <Monitor size={13} /> Systems
                          </button>

                          {/* Activate / Deactivate */}
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleToggleActive(u.id, u.is_active)}
                              disabled={updating === u.id}
                              className="flex items-center gap-1.5 text-xs text-brand-steel hover:text-brand-navy transition-colors disabled:opacity-50"
                            >
                              {u.is_active ? (
                                <><UserX size={13} /> Deactivate</>
                              ) : (
                                <><UserCheck size={13} /> Reactivate</>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create user modal */}
      {showInvite && (
        <InviteUserModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => { setShowInvite(false); loadAll() }}
        />
      )}

      {/* Manage systems modal */}
      {managingUser && (
        <ManageUserSystemsModal
          user={managingUser}
          currentSystemIds={(systemsByUser[managingUser.id] || []).map(s => s.id)}
          onClose={() => setManagingUser(null)}
          onSuccess={() => { setManagingUser(null); loadAll() }}
        />
      )}
    </PageWrapper>
  )
}
