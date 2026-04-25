import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { profile, organisation, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-brand-off-white">
      <nav className="bg-brand-navy px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-white">
          Iterate<span className="text-brand-blue">IT</span>
        </h1>
        <button
          onClick={handleSignOut}
          className="text-brand-steel text-sm hover:text-white transition-colors"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="font-display text-3xl font-extrabold text-brand-navy mb-2">
          Welcome, {profile?.full_name || 'there'}!
        </h2>
        <p className="text-brand-steel text-sm mb-8">
          {organisation?.name} · {profile?.role}
        </p>
        <div className="bg-white rounded-lg p-8 shadow-sm border border-brand-divider">
          <p className="text-brand-navy text-sm">
            🎉 You're logged in. Dashboard coming next.
          </p>
        </div>
      </div>
    </div>
  )
}