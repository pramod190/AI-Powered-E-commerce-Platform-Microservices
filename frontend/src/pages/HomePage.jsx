import React, { useState, useEffect, useCallback } from 'react'
import { productService } from '../services/api'
import { ProductCard } from '../components/ProductCard'
import { SkeletonCard } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import {
  FiSearch, FiSliders, FiX, FiTrendingUp, FiPackage,
  FiZap, FiGrid, FiStar
} from 'react-icons/fi'

const CATEGORIES = [
  { value: '', label: 'All', icon: '🛍️' },
  { value: 'Electronics', label: 'Electronics', icon: '⚡' },
  { value: 'Office Supplies', label: 'Office', icon: '🖊️' },
  { value: 'Storage', label: 'Storage', icon: '💾' },
  { value: 'Cables & Adapters', label: 'Cables', icon: '🔌' },
  { value: 'Accessories', label: 'Accessories', icon: '🎒' },
]

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
]

const STATS = [
  { icon: FiPackage, label: 'Products', value: '10K+' },
  { icon: FiStar,    label: 'Reviews',  value: '50K+' },
  { icon: FiZap,     label: 'Fast Ship', value: '24hr'  },
  { icon: FiTrendingUp, label: 'Brands', value: '200+'  },
]

export function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('createdAt-desc')
  const [showFilters, setShowFilters] = useState(false)
  const { user } = useAuth()

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 500)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError('')
        const [sortBy, sortOrder] = sort.split('-')

        let data = []

        try {
          const res = await productService.searchProducts(
            debouncedQuery,
            category,
            minPrice ? Number(minPrice) : 0,
            maxPrice ? Number(maxPrice) : 10000,
          )
          // Handle various response shapes
          data = res.data?.data || res.data?.products || res.data || []
        } catch {
          // Final fallback
          const res = await productService.getAllProducts()
          data = res.data?.data || res.data?.products || res.data || []
        }

        if (!Array.isArray(data)) data = []

        // Client-side sort if needed
        if (sortBy === 'price') {
          data = [...data].sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price)
        }

        setProducts(data)
      } catch (err) {
        console.error('Product fetch failed:', err)
        setError('Unable to connect to product service. Make sure the product service is running on port 4002.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [debouncedQuery, category, minPrice, maxPrice, sort])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setSort('createdAt-desc')
  }, [])

  const hasFilters = searchQuery || category || minPrice || maxPrice

  return (
    <div className="page-wrapper">
      {/* ── Ambient Orbs ── */}
      <div className="orb orb-purple" style={{ width: 600, height: 600, top: -200, left: -200 }} />
      <div className="orb orb-pink"   style={{ width: 400, height: 400, top: 200,  right: -100 }} />
      <div className="orb orb-blue"   style={{ width: 300, height: 300, top: 600,  left: '40%' }} />

      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-16 px-4" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fadeUp"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <FiZap size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 tracking-widest uppercase">Next-Gen Shopping</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-none animate-fadeUp"
            style={{ fontFamily: "'Space Grotesk',sans-serif", animationDelay: '0.1s' }}>
            <span style={{
              background: 'linear-gradient(135deg,#e2e8f0 0%,#a5b4fc 50%,#e879f9 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Shop Smarter.
            </span>
            <br />
            <span style={{ color: '#1e293b',
              background: 'linear-gradient(135deg,#f59e0b,#f97316)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Live Better.
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            Discover thousands of premium products curated just for you.
            AI-powered recommendations. Lightning-fast delivery.
          </p>

          {/* ── Search Bar ── */}
          <div className="relative max-w-2xl mx-auto animate-fadeUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search products, brands, categories…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12 pr-4 py-4 text-base"
                  style={{ borderRadius: 16 }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    <FiX size={18} />
                  </button>
                )}
              </div>
              <button
                id="filter-toggle"
                onClick={() => setShowFilters(f => !f)}
                className="btn btn-ghost px-5"
                style={{ borderRadius: 16, minWidth: 56 }}>
                <FiSliders size={20} className={showFilters ? 'text-indigo-400' : ''} />
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-3 p-5 rounded-2xl animate-slideDown"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Min Price</label>
                    <input type="number" placeholder="$0" value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Max Price</label>
                    <input type="number" placeholder="$10,000" value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Sort By</label>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field">
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#1e293b' }}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="relative px-4 mb-12" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, label, value }, i) => (
            <div key={label} className="glass-card flex flex-col items-center py-4 px-2 animate-fadeUp"
              style={{ animationDelay: `${0.1 * i}s` }}>
              <Icon size={20} className="text-indigo-400 mb-2" />
              <span className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{value}</span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Pills ── */}
      <section className="relative px-4 mb-10" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const active = category === cat.value
            return (
              <button
                key={cat.value}
                id={`cat-${cat.value || 'all'}`}
                onClick={() => setCategory(cat.value)}
                className="flex-none flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                  border: active ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? 'white' : '#94a3b8',
                  boxShadow: active ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                  transform: active ? 'scale(1.04)' : 'scale(1)',
                }}>
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            )
          })}
          {hasFilters && (
            <button onClick={clearFilters}
              className="flex-none flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-red-400 whitespace-nowrap transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <FiX size={14} /> Clear
            </button>
          )}
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="relative px-4 pb-20" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">
                {searchQuery ? `Results for "${searchQuery}"` : category || 'All Products'}
              </h2>
              {!loading && (
                <p className="text-sm text-slate-500 mt-1">
                  {products.length} product{products.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm">
              <FiGrid size={16} />
              <span>Grid View</span>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="glass-card p-8 text-center mb-8" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-400 font-semibold mb-2">Connection Error</p>
              <p className="text-slate-500 text-sm">{error}</p>
              <button onClick={() => window.location.reload()}
                className="btn btn-ghost mt-4 text-sm">
                Retry
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <div className="glass-card p-16 text-center">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">No products found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          )}

          {/* Products */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <div key={product.id || product._id || i}
                  className="animate-fadeUp"
                  style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}>
                  <ProductCard product={{ ...product, id: product.id || product._id }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
