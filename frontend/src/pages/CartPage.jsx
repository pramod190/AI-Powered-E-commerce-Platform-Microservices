import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import {
  FiTrash2, FiPlus, FiMinus, FiShoppingBag,
  FiArrowLeft, FiShoppingCart, FiTruck, FiShield,
  FiZap, FiChevronRight, FiTag
} from 'react-icons/fi'

/* ── Trust badges ─────────────────────────── */
const TRUST = [
  { icon: FiShield, label: 'Secure Checkout',    sub: 'SSL Encrypted' },
  { icon: FiTruck,  label: 'Free Shipping',       sub: 'On orders over $50' },
  { icon: FiZap,    label: 'Fast Delivery',        sub: 'Within 24 hours' },
]

/* ── Cart Item Row ────────────────────────── */
function CartItem({ item, onUpdate, onRemove }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-fadeUp"
      style={{
        background: hovered ? 'rgba(255,255,255,0.065)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20,
        padding: '1.25rem 1.5rem',
        transition: 'all 0.3s ease',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.35)' : '0 2px 12px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex gap-5 items-start">
        {/* Product image */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            width: 100, height: 100,
            borderRadius: 14,
            background: 'linear-gradient(135deg,#1e1b4b,#312e81)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <img
            src={item.image || `https://picsum.photos/seed/${encodeURIComponent(item.name)}/200/200`}
            alt={item.name}
            className="w-full h-full object-cover"
            style={{ opacity: 0.85, borderRadius: 14 }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-base mb-1 truncate"
            style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk',sans-serif" }}
          >
            {item.name}
          </h3>

          {/* Unit price */}
          <p className="text-sm mb-3" style={{ color: '#64748b' }}>
            Unit price:{' '}
            <span style={{
              fontWeight: 700,
              background: 'linear-gradient(135deg,#f59e0b,#f97316)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {formatPrice(Number(item.price))}
            </span>
          </p>

          {/* Quantity + subtotal + remove */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Quantity control */}
            <div
              className="flex items-center"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => onUpdate(item.productId, item.quantity - 1)}
                className="flex items-center justify-center transition-all"
                style={{ width: 36, height: 36, color: '#94a3b8' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FiMinus size={15} />
              </button>

              <span
                className="font-bold text-sm"
                style={{ width: 36, textAlign: 'center', color: '#f1f5f9', userSelect: 'none' }}
              >
                {item.quantity}
              </span>

              <button
                onClick={() => onUpdate(item.productId, item.quantity + 1)}
                className="flex items-center justify-center transition-all"
                style={{ width: 36, height: 36, color: '#94a3b8' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FiPlus size={15} />
              </button>
            </div>

            {/* Item subtotal */}
            <div className="text-right">
              <p className="text-[11px] font-medium mb-0.5" style={{ color: '#475569' }}>Subtotal</p>
              <p className="text-lg font-black" style={{
                fontFamily: "'Space Grotesk',sans-serif",
                background: 'linear-gradient(135deg,#f59e0b,#f97316)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {formatPrice(Number(item.price) * item.quantity)}
              </p>
            </div>

            {/* Remove */}
            <button
              onClick={() => onRemove(item.productId)}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
              }}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main CartPage ────────────────────────── */
export function CartPage() {
  const cart = useCart()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  const subtotal   = cart.total || 0
  const discount   = couponApplied ? subtotal * 0.1 : 0
  const shipping   = subtotal > 50 ? 0 : 4.99
  const tax        = (subtotal - discount) * 0.08
  const total      = subtotal - discount + shipping + tax

  /* ── Empty State ── */
  if (cart.items.length === 0) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-screen px-4">
        {/* Orbs */}
        <div className="orb orb-purple" style={{ width: 400, height: 400, top: -100, left: -100 }} />
        <div className="orb orb-pink"   style={{ width: 300, height: 300, bottom: 0, right: -50 }} />

        <div className="relative text-center animate-fadeUp" style={{ zIndex: 1 }}>
          {/* Animated bag icon */}
          <div
            className="mx-auto mb-8 flex items-center justify-center"
            style={{
              width: 120, height: 120,
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.1)',
              border: '2px solid rgba(99,102,241,0.2)',
              boxShadow: '0 0 60px rgba(99,102,241,0.15)',
              animation: 'float 4s ease-in-out infinite',
            }}
          >
            <FiShoppingBag size={52} style={{ color: '#6366f1', opacity: 0.8 }} />
          </div>

          <h1
            className="text-4xl font-black mb-3"
            style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#f1f5f9' }}
          >
            Your cart is empty
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
            Looks like you haven't added anything yet. Let's change that!
          </p>

          <button
            onClick={() => navigate('/')}
            className="btn btn-primary px-8 py-3 text-base"
          >
            <FiArrowLeft size={18} />
            Start Shopping
          </button>
        </div>
      </div>
    )
  }

  /* ── Cart with items ── */
  return (
    <div className="page-wrapper min-h-screen px-4 py-10">
      {/* Ambient orbs */}
      <div className="orb orb-purple" style={{ width: 500, height: 500, top: -150, left: -150 }} />
      <div className="orb orb-pink"   style={{ width: 350, height: 350, top: 300, right: -100 }} />

      <div className="relative max-w-7xl mx-auto" style={{ zIndex: 1 }}>
        {/* ── Page header ── */}
        <div className="mb-10 animate-fadeUp">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost px-4 py-2 text-sm mb-5"
          >
            <FiArrowLeft size={16} /> Back to Shopping
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 6px 24px rgba(99,102,241,0.4)' }}
            >
              <FiShoppingCart size={22} className="text-white" />
            </div>
            <div>
              <h1
                className="text-3xl font-black"
                style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#f1f5f9' }}
              >
                Shopping Cart
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in your cart
              </p>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Items (left) ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
                Items
              </h2>
              <button
                onClick={cart.clearCart}
                className="text-xs font-medium transition-colors"
                style={{ color: '#f87171' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
                onMouseLeave={e => e.currentTarget.style.color = '#f87171'}
              >
                Remove all
              </button>
            </div>

            {cart.items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdate={cart.updateItem}
                onRemove={cart.removeItem}
              />
            ))}
          </div>

          {/* ── Order Summary (right) ── */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '1.75rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              }}
            >
              <h2
                className="text-xl font-bold mb-6"
                style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#f1f5f9' }}
              >
                Order Summary
              </h2>

              {/* Coupon code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      className="input-field pl-9 py-2.5 text-sm"
                      style={{ borderRadius: 12 }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (coupon === 'SHOP10') setCouponApplied(true)
                    }}
                    className="btn btn-ghost px-4 py-2.5 text-sm"
                    style={{ borderRadius: 12, minWidth: 70 }}
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: '#86efac' }}>
                    ✓ 10% discount applied!
                  </p>
                )}
                {!couponApplied && (
                  <p className="text-xs mt-2" style={{ color: '#475569' }}>
                    Try <span className="font-mono text-indigo-400">SHOP10</span> for 10% off
                  </p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#94a3b8' }}>Subtotal ({cart.itemCount} items)</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{formatPrice(subtotal)}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#94a3b8' }}>Discount (10%)</span>
                    <span style={{ color: '#86efac', fontWeight: 600 }}>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span style={{ color: '#94a3b8' }}>Shipping</span>
                  <span style={{ color: shipping === 0 ? '#86efac' : '#e2e8f0', fontWeight: 600 }}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span style={{ color: '#94a3b8' }}>Tax (8%)</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{formatPrice(tax)}</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)', margin: '1rem 0' }} />

              {/* Total */}
              <div
                className="flex justify-between items-center mb-6 p-4 rounded-2xl"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <span className="font-bold text-lg" style={{ color: '#c7d2fe' }}>Total</span>
                <span
                  className="text-3xl font-black"
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    background: 'linear-gradient(135deg,#f59e0b,#f97316)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {formatPrice(total)}
                </span>
              </div>

              {/* Checkout button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn btn-primary py-4 text-base font-bold mb-3"
                style={{ borderRadius: 16, fontSize: 16 }}
              >
                Checkout
                <FiChevronRight size={20} />
              </button>

              {/* Continue shopping */}
              <button
                onClick={() => navigate('/')}
                className="w-full btn btn-ghost py-3 text-sm"
                style={{ borderRadius: 16 }}
              >
                <FiArrowLeft size={15} />
                Continue Shopping
              </button>

              {/* Trust badges */}
              <div
                className="mt-6 pt-5 space-y-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
              >
                {TRUST.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)' }}
                    >
                      <Icon size={15} style={{ color: '#a5b4fc' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#cbd5e1' }}>{label}</p>
                      <p className="text-[10px]" style={{ color: '#475569' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
