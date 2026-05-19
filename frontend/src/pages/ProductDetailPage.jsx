import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/api'
import { LoadingPage } from '../components/Loading'
import { ProductCard } from '../components/ProductCard'
import { Alert } from '../components/Alert'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import {
  FiPlus, FiMinus, FiStar, FiArrowLeft, FiCheck,
  FiTruck, FiShield, FiRefreshCw, FiShoppingCart,
  FiHeart, FiShare2, FiPackage, FiZap
} from 'react-icons/fi'

/* ── Category color map ─────────────────── */
const CAT_COLORS = {
  'Electronics':       { bg: 'rgba(99,102,241,0.2)',  text: '#a5b4fc', border: 'rgba(99,102,241,0.35)' },
  'Office Supplies':   { bg: 'rgba(34,197,94,0.15)',  text: '#86efac', border: 'rgba(34,197,94,0.3)' },
  'Storage':           { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
  'Cables & Adapters': { bg: 'rgba(236,72,153,0.15)', text: '#f9a8d4', border: 'rgba(236,72,153,0.3)' },
  'Accessories':       { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
}
const DefaultCat = { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd', border: 'rgba(139,92,246,0.3)' }

const PERKS = [
  { icon: FiCheck,     label: 'Premium quality materials' },
  { icon: FiTruck,     label: 'Free shipping on orders over $50' },
  { icon: FiShield,    label: 'Secure & encrypted checkout' },
  { icon: FiRefreshCw, label: '30-day money-back guarantee' },
]

function nameToGradient(name = '') {
  const gradients = [
    'linear-gradient(135deg,#1e1b4b,#312e81)',
    'linear-gradient(135deg,#1a0533,#3b0764)',
    'linear-gradient(135deg,#0f172a,#1e3a5f)',
    'linear-gradient(135deg,#0d1117,#1f2d3d)',
    'linear-gradient(135deg,#1c0d2e,#2d1b69)',
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return gradients[Math.abs(h) % gradients.length]
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct]           = useState(null)
  const [similar, setSimilar]           = useState([])
  const [quantity, setQuantity]         = useState(1)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [added, setAdded]               = useState(false)
  const [liked, setLiked]               = useState(false)
  const [activeImg, setActiveImg]       = useState(0)
  const [successMsg, setSuccessMsg]     = useState('')

  /* ── Fetch product ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await productService.getProduct(id)
        const p = res.data?.product || res.data
        setProduct({ ...p, id: p.id || p._id })
      } catch {
        setError('Failed to load product. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  /* ── Fetch similar ── */
  useEffect(() => {
    if (!product?.id) return
    const load = async () => {
      try {
        const res = await productService.searchProducts('', product.category, 0, 10000)
        const arr = res.data?.data || res.data?.products || res.data || []
        setSimilar(arr.filter(p => (p.id || p._id) !== product.id).slice(0, 4)
          .map(p => ({ ...p, id: p.id || p._id })))
      } catch { /* silent */ }
    }
    load()
  }, [product])

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return
    addItem(product, quantity)
    setAdded(true)
    setSuccessMsg(`${quantity} × "${product.name}" added to cart!`)
    setTimeout(() => { setAdded(false); setSuccessMsg('') }, 2500)
  }

  if (loading) return <LoadingPage />

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-screen px-4">
        <div className="orb orb-purple" style={{ width: 400, height: 400, top: -100, left: -100 }} />
        <div className="text-center animate-fadeUp" style={{ zIndex: 1 }}>
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-2xl font-bold text-slate-300 mb-3">Product not found</h2>
          <p className="text-slate-500 mb-8">This product may have been removed or doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary px-8 py-3">
            <FiArrowLeft size={17} /> Back to Store
          </button>
        </div>
      </div>
    )
  }

  const stars      = Math.round(product.rating || 4)
  const catColor   = CAT_COLORS[product.category] || DefaultCat
  const isOutOfStock = product.stock === 0
  const imgGradient  = nameToGradient(product.name)

  /* ── Faux image gallery thumbnails (same image × 3 for now) ── */
  const images = [product.image, product.image, product.image].filter(Boolean)

  return (
    <div className="page-wrapper min-h-screen">
      {/* Ambient orbs */}
      <div className="orb orb-purple" style={{ width: 600, height: 600, top: -200, left: -200 }} />
      <div className="orb orb-pink"   style={{ width: 400, height: 400, top: 400,  right: -100 }} />

      {/* Success toast */}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
      {error      && <Alert type="error"   message={error}      onClose={() => setError('')} />}

      <div className="relative max-w-7xl mx-auto px-4 py-10" style={{ zIndex: 1 }}>

        {/* ── Back button ── */}
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost px-4 py-2 text-sm mb-8 animate-fadeUp"
        >
          <FiArrowLeft size={16} /> Back to Shopping
        </button>

        {/* ── Main product section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">

          {/* ── Left: Image Panel ── */}
          <div className="animate-fadeUp">
            {/* Main image */}
            <div
              className="relative overflow-hidden mb-4"
              style={{
                borderRadius: 24,
                background: imgGradient,
                border: '1px solid rgba(255,255,255,0.08)',
                height: 420,
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              }}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.88, transition: 'transform 0.5s ease' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiPackage size={80} style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top,rgba(10,10,15,0.6) 0%,transparent 50%)' }} />

              {/* Category badge */}
              <div className="absolute top-4 left-4">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}`, backdropFilter: 'blur(8px)' }}>
                  {product.category}
                </span>
              </div>

              {/* Wishlist + Share */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setLiked(l => !l)}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
                  style={{
                    background: liked ? 'rgba(239,68,68,0.8)' : 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                  <FiHeart size={16} className={liked ? 'text-white fill-current' : 'text-white'} />
                </button>
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <FiShare2 size={15} className="text-white" />
                </button>
              </div>

              {/* Out of stock ribbon */}
              {isOutOfStock && (
                <div className="absolute bottom-0 left-0 right-0 py-3 text-center text-sm font-bold"
                  style={{ background: 'rgba(239,68,68,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}>
                  Out of Stock
                </div>
              )}
            </div>

            {/* Thumbnail strip (decorative) */}
            {images.length > 0 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="overflow-hidden transition-all"
                    style={{
                      width: 72, height: 72, borderRadius: 12,
                      background: imgGradient,
                      border: `2px solid ${activeImg === i ? '#6366f1' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: activeImg === i ? '0 0 16px rgba(99,102,241,0.5)' : 'none',
                      flexShrink: 0,
                    }}>
                    {img && (
                      <img src={img} alt="" className="w-full h-full object-cover"
                        style={{ opacity: 0.8 }} onError={(e) => { e.target.style.display = 'none' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info Panel ── */}
          <div className="flex flex-col gap-6 animate-fadeUp" style={{ animationDelay: '0.1s' }}>

            {/* Name */}
            <div>
              <h1
                className="text-3xl lg:text-4xl font-black mb-4 leading-tight"
                style={{ fontFamily: "'Space Grotesk',sans-serif", color: '#f1f5f9' }}
              >
                {product.name}
              </h1>

              {/* Stars & reviews */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={18}
                      style={{ color: i < stars ? '#f59e0b' : 'rgba(255,255,255,0.15)', fill: i < stars ? '#f59e0b' : 'none' }} />
                  ))}
                </div>
                <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
                  {(product.rating || 4.0).toFixed(1)}
                </span>
                <span className="text-sm" style={{ color: '#475569' }}>
                  ({product.reviews || 0} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-base leading-relaxed" style={{ color: '#94a3b8' }}>
                {product.description || 'Premium quality product with excellent craftsmanship.'}
              </p>
            </div>

            {/* Perks list */}
            <div
              className="p-5 rounded-2xl space-y-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {PERKS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <Icon size={14} style={{ color: '#a5b4fc' }} />
                  </div>
                  <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Purchase box */}
            <div
              className="p-6 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              }}
            >
              {/* Price */}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Price</p>
                  <span className="text-5xl font-black"
                    style={{
                      fontFamily: "'Space Grotesk',sans-serif",
                      background: 'linear-gradient(135deg,#f59e0b,#f97316)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    {formatPrice(product.price)}
                  </span>
                </div>

                {/* Stock badge */}
                <div className="text-right">
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={
                      isOutOfStock
                        ? { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }
                        : product.stock <= 5
                          ? { background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }
                          : { background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }
                    }
                  >
                    {isOutOfStock
                      ? 'Out of Stock'
                      : product.stock <= 5
                        ? `Only ${product.stock} left!`
                        : `✓ ${product.stock} in stock`}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', margin: '1rem 0' }} />

              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#475569' }}>
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 14,
                        overflow: 'hidden',
                      }}>
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex items-center justify-center transition-all"
                        style={{ width: 44, height: 44, color: '#94a3b8' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <FiMinus size={16} />
                      </button>

                      <span className="font-black text-lg"
                        style={{ width: 48, textAlign: 'center', color: '#f1f5f9', userSelect: 'none', fontFamily: "'Space Grotesk',sans-serif" }}>
                        {quantity}
                      </span>

                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="flex items-center justify-center transition-all"
                        style={{ width: 44, height: 44, color: '#94a3b8' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>

                    <span className="text-sm" style={{ color: '#475569' }}>
                      Total: <span className="font-bold" style={{ color: '#f1f5f9' }}>
                        {formatPrice(Number(product.price) * quantity)}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all"
                style={{
                  background: isOutOfStock
                    ? 'rgba(255,255,255,0.05)'
                    : added
                      ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                      : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: isOutOfStock ? '#475569' : 'white',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  boxShadow: !isOutOfStock && !added ? '0 8px 32px rgba(99,102,241,0.5)' : 'none',
                  transform: added ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.25s ease',
                  border: 'none',
                  fontSize: 16,
                }}
                onMouseEnter={e => { if (!isOutOfStock && !added) e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                {added
                  ? <><FiCheck size={20} /> Added to Cart!</>
                  : isOutOfStock
                    ? 'Out of Stock'
                    : <><FiShoppingCart size={20} /> Add to Cart</>}
              </button>
            </div>

            {/* Delivery estimate */}
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <FiZap size={18} style={{ color: '#a5b4fc', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                <span style={{ color: '#c7d2fe', fontWeight: 600 }}>Fast delivery available</span> — Order within 2 hours for same-day dispatch
              </p>
            </div>
          </div>
        </div>

        {/* ── Similar Products ── */}
        {similar.length > 0 && (
          <section className="animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">You Might Also Like</h2>
                <p className="text-slate-500 text-sm mt-1">More from {product.category}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
