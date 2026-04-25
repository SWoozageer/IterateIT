import { useAuth } from '../context/AuthContext'
import PageWrapper from '../components/layout/PageWrapper'
import { Ticket, CheckCircle, Clock, AlertCircle } from 'lucide-react'

// Summary stat card
function StatCard({ icon: Icon, label, value, colour }) {
  return (
    <div className="bg-white rounded-lg border border-brand-divider p-6 flex items-center gap-4">
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

export default function Dashboard() {
  const { profile } = useAuth()

  return (
    <PageWrapper
      title={`Welcome, ${profile?.full_name || 'there'}!`}
      subtitle="Here's a summary of what's happening across your systems."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Ticket}      label="Total Tickets"    value="—" colour="bg-brand-blue"    />
        <StatCard icon={Clock}       label="In Progress"      value="—" colour="bg-yellow-400"    />
        <StatCard icon={AlertCircle} label="Critical"         value="—" colour="bg-red-500"       />
        <StatCard icon={CheckCircle} label="Resolved Today"   value="—" colour="bg-green-500"     />
      </div>

      {/* Placeholder for recent tickets */}
      <div className="bg-white rounded-lg border border-brand-divider p-6">
        <h3 className="font-display text-lg font-extrabold text-brand-navy mb-4">
          Recent Tickets
        </h3>
        <p className="text-brand-steel text-sm">
          Tickets will appear here once you start logging them.
        </p>
      </div>
    </PageWrapper>
  )
}