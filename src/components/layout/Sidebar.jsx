import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react'

// Navigation items — role-based visibility handled below
const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets',   icon: Ticket,          label: 'Tickets'   },
  { to: '/users',     icon: Users,           label: 'Users',    roles: ['super_admin','org_admin'] },
  { to: '/settings',  icon: Settings,        label: 'Settings', roles: ['super_admin','org_admin'] },
]

export default function Sidebar() {
  const { profile, organisation, role, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-brand-navy flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-dark-divider">
        <h1 className="font-display text-2xl font-extrabold text-white">
          Iterate<span className="text-brand-blue">IT</span>
        </h1>
        <p className="text-brand-steel text-xs tracking-widest uppercase mt-0.5">
          Log It · Track It · Fix It
        </p>
      </div>

      {/* Organisation badge */}
      <div className="px-6 py-4 border-b border-brand-dark-divider">
        <p className="text-brand-steel text-xs uppercase tracking-wider mb-1">Organisation</p>
        <p className="text-white text-sm font-semibold truncate">
          {organisation?.name || '—'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, roles }) => {
          // Hide items the current role doesn't have access to
          if (roles && !roles.includes(role)) return null

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-brand-blue text-white'
                    : 'text-brand-steel hover:text-white hover:bg-brand-dark-divider'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          )
        })}
      </nav>

      {/* User profile + sign out */}
      <div className="px-4 py-4 border-t border-brand-dark-divider">
        <div className="flex items-center gap-3 mb-3 px-2">
          {/* Avatar initials */}
          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {profile?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {profile?.full_name}
            </p>
            <p className="text-brand-steel text-xs capitalize">
              {role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-brand-steel hover:text-white hover:bg-brand-dark-divider text-sm transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

    </aside>
  )
}