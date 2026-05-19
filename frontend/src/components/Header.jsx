import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingCart, FiLogOut, FiZap, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            <FiZap size={18} className="text-white" />
          </div>
          <span
            className="text-xl font-bold hidden sm:block"
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              background: 'linear-gradient(135deg,#a5b4fc,#e879f9)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ShopHub
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
            Home
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* User avatar */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-sm text-slate-300 font-medium">{user?.name || user?.email?.split('@')[0]}</span>
              </div>

              {/* Cart */}
              <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <FiShoppingCart size={19} className="text-indigo-400" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Logout */}
              <button onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 transition-all"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <FiLogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-xl transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                Sign In
              </Link>
              <Link to="/register"
                className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
