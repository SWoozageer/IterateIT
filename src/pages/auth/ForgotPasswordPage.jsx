import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()

  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for a password reset link.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-extrabold text-white">
            Iterate<span className="text-brand-blue">IT</span>
          </h1>
          <p className="text-brand-steel text-xs tracking-widest uppercase mt-1">
            Log It · Track It · Fix It
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <h2 className="text-brand-navy font-display text-2xl font-extrabold mb-2">
            Reset password
          </h2>
          <p className="text-brand-steel text-sm mb-6">
            Enter your email and we'll send you a reset link.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded px-4 py-3 mb-4">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-brand-divider rounded px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="you@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue text-white font-semibold text-sm py-2.5 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-xs text-brand-blue hover:underline">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}