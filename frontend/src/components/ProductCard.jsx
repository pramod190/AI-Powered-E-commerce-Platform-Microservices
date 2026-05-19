import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiHeart, FiStar, FiCheck, FiEye } from 'react-icons/fi'
import { formatPrice } from '../utils/helpers'
import { useCart } from '../context/CartContext'

// Category color map
const CAT_COLORS = {
  'Electronics':       { bg: 'rgba(99,102,241,0.2)',  text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  'Office Supplies':   { bg: 'rgba(34,197,94,0.15)',  text: '#86efac', border: 'rgba(34,197,94,0.3)' },
  'Storage':           { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
  'Cables & Adapters': { bg: 'rgba(236,72,153,0.15)', text: '#f9a8d4', border: 'rgba(236,72,153,0.3)' },
  'Accessories':       { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
}
const DefaultColor = { bg: 'rgba(99,102,241,0.15)', text: '#c4b5fd', border: 'rgba(139,92,246,0.3)' }

// Generate a deterministic gradient from product name
function nameToGradient(name = '') {
  const gradients = [
    'linear-gradient(135deg,#1e1b4b,#312e81)',
    'linear-gradient(135deg,#1a0533,#3b0764)',
    'linear-gradient(135deg,#0f172a,#1e3a5f)',
    'linear-gradient(135deg,#0d1117,#1f2d3d)',
    'linear-gradient(135deg,#1c0d2e,#2d1b69)',
    'linear-gradient(135deg,#0f0f1a,#1e1040)',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

export function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [liked, setLiked] = useState(false)
  const [hovered, setHovered] = useState(false)

  const catColor = CAT_COLORS[product.category] || DefaultColor
  const gradient = nameToGradient(product.name)
  const stars = Math.round(product.rating || 4)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(l => !l)
  }

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${hovered ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 20,
          overflow: 'hidden',
          transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
          transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.2)'
            : '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* ── Image area ── */}
        <div className="relative overflow-hidden" style={{ height: 220, background: gradient }}>
          <img
            src={product.image || `https://picsum.photos/seed/${encodeURIComponent(product.name)}/400/300`}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)', opacity: 0.85 }}
            onError={(e) => { e.target.style.display = 'none' }}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top,rgba(10,10,15,0.8) 0%,transparent 60%)', opacity: hovered ? 1 : 0.6, transition: 'opacity 0.3s' }} />

          {/* Badges row */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}`, backdropFilter: 'blur(8px)' }}>
              {product.category}
            </span>
            {isOutOfStock && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', backdropFilter: 'blur(8px)' }}>
                Out of Stock
              </span>
            )}
          </div>

          {/* Hover action buttons */}
          <div className="absolute bottom-3 right-3 flex gap-2"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.3s ease' }}>
            <button onClick={handleLike}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
              style={{ background: liked ? 'rgba(239,68,68,0.8)' : 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <FiHeart size={14} className={liked ? 'text-white fill-current' : 'text-white'} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <FiEye size={14} className="text-white" />
            </button>
          </div>

          {/* Stock indicator */}
          {!isOutOfStock && product.stock <= 5 && (
            <div className="absolute bottom-3 left-3">
              <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.8)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                Only {product.stock} left!
              </span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-5">
          {/* Name */}
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-snug"
            style={{ color: hovered ? '#e2e8f0' : '#cbd5e1', transition: 'color 0.2s', fontFamily: "'Space Grotesk',sans-serif" }}>
            {product.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={12}
                  style={{ color: i < stars ? '#f59e0b' : 'rgba(255,255,255,0.15)', fill: i < stars ? '#f59e0b' : 'none' }} />
              ))}
            </div>
            <span className="text-[11px]" style={{ color: '#64748b' }}>({product.reviews || 0})</span>
          </div>

          {/* Description */}
          <p className="text-xs line-clamp-2 mb-4" style={{ color: '#475569', lineHeight: 1.5 }}>
            {product.description || 'Premium quality product'}
          </p>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <p className="text-[10px] font-medium mb-0.5" style={{ color: '#475569' }}>Price</p>
              <span className="text-lg font-bold" style={{
                fontFamily: "'Space Grotesk',sans-serif",
                background: 'linear-gradient(135deg,#f59e0b,#f97316)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {formatPrice(product.price)}
              </span>
            </div>

            <button onClick={handleAddToCart} disabled={isOutOfStock}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all"
              style={{
                background: isOutOfStock
                  ? 'rgba(255,255,255,0.05)'
                  : added
                    ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                    : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: isOutOfStock ? '#475569' : 'white',
                boxShadow: !isOutOfStock && !added ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                transform: hovered && !isOutOfStock ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}>
              {added ? <FiCheck size={15} /> : <FiShoppingCart size={15} />}
              {added ? 'Added!' : isOutOfStock ? 'Sold Out' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
