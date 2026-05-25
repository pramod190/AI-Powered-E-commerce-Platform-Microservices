import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validatePassword } from '../utils/helpers'
import { FiMail, FiLock, FiZap, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }     = useAuth()
  const navigate      = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateEmail(email))    { setError('Please enter a valid email address'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) navigate('/')
    else setError(result.error || 'Login failed. Please try again.')
  }

  return (
    <div className="page-wrapper flex items-center justify-center min-h-screen px-4 py-16">
      {/* ── Ambient Orbs ── */}
      <div className="orb orb-purple" style={{ width: 500, height: 500, top: -150, left: -150 }} />
      <div className="orb orb-pink"   style={{ width: 350, height: 350, bottom: -100, right: -80 }} />
      <div className="orb orb-blue"   style={{ width: 250, height: 250, top: '40%', left: '60%' }} />

      <div className="relative w-full max-w-md animate-fadeUp" style={{ zIndex: 1 }}>

        {/* ── Logo + Heading ── */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow: '0 8px 40px rgba(99,102,241,0.55)',
            }}
          >
            <FiZap size={28} className="text-white" />
          </div>

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            <span className="text-xs font-semibold text-indigo-300 tracking-widest uppercase">ShopHub</span>
          </div>

          <h1
            className="text-4xl font-black text-white mb-2"
            style={{ fontFamily: "'Space Grotesk',sans-serif" }}
          >
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm">Sign in to continue shopping</p>
        </div>

        {/* ── Glass Card ── */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: '2.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Error banner */}
          {error && (
            <div
              className="mb-6 p-4 rounded-xl text-sm flex items-start gap-3"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5',
              }}
            >
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                style={{ color: '#94a3b8' }}
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={17}
                  style={{ color: '#6366f1' }}
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                style={{ color: '#94a3b8' }}
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={17}
                  style={{ color: '#6366f1' }}
                />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: showPwd ? '#6366f1' : '#475569' }}
                  tabIndex={-1}
                >
                  {showPwd ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3.5 mt-2"
              style={{
                fontSize: 15,
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 700,
                letterSpacing: '0.02em',
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    style={{ animation: 'spin 0.7s linear infinite' }}
                  />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <FiArrowRight size={17} />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider" />

          <p className="text-center text-sm" style={{ color: '#64748b' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors hover:text-indigo-300"
              style={{ color: '#a5b4fc' }}
            >
              Create one free →
            </Link>
          </p>
        </div>

        {/* Bottom hint */}
        <p className="text-center mt-6 text-xs" style={{ color: '#334155' }}>
          By signing in you agree to our{' '}
          <span style={{ color: '#475569' }}>Terms of Service</span> &amp;{' '}
          <span style={{ color: '#475569' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
