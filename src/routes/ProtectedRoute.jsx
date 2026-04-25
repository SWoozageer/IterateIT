import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps any page that requires the user to be logged in
// If not logged in → redirects to /login automatically
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth()

  // Still checking session — show nothing yet
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-brand-steel text-sm tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </div>
    )
  }

  // Not logged in → go to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → go to dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}