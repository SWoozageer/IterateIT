import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import Dashboard from './pages/Dashboard'
import TicketsPage from './pages/TicketsPage'
import NewTicketPage from './pages/NewTicketPage'
import TicketDetailPage from './pages/TicketDetailPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/tickets" element={
          <ProtectedRoute><TicketsPage /></ProtectedRoute>
        } />
        <Route path="/tickets/new" element={
          <ProtectedRoute><NewTicketPage /></ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={
          <ProtectedRoute><TicketDetailPage /></ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['super_admin','org_admin']}>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
