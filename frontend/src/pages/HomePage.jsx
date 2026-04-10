import React, { useState, useEffect } from 'react'
import { productService, recommendationService } from '../services/api'
import { ProductCard } from '../components/ProductCard'
import { LoadingPage } from '../components/Loading'
import { Alert } from '../components/Alert'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Storage', label: 'Storage' },
  { value: 'Cables & Adapters', label: 'Cables & Adapters' },
  { value: 'Accessories', label: 'Accessories' },
]

export function HomePage() {
  const [products, setProducts] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(10000)
  const { user } = useAuth()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await productService.searchProducts(
          searchQuery,
          category,
          minPrice,
          maxPrice
        )
        setProducts(response.data.data || response.data)
        setError('')
      } catch (err) {
        setError('Failed to load products')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchProducts, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, category, minPrice, maxPrice])

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (user?.id) {
        try {
          const response = await recommendationService.getUserRecommendations(user.id, 6)
          setRecommendations(response.data.recommendations || [])
        } catch (err) {
          console.error('Failed to load recommendations', err)
        }
      }
    }

    fetchRecommendations()
  }, [user])

  if (loading && products.length === 0) {
    return <LoadingPage />
  }

  const hasActiveFilters = searchQuery || category || minPrice !== 0 || maxPrice !== 10000

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 mb-12">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-3">Welcome to ShopHub</h1>
          <p className="text-xl text-blue-100">Discover amazing products at great prices</p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 pb-12">
        {/* Search & Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          {/* Search Bar */}
          <div className="mb-6 flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 font-semibold">
              <FiFilter size={20} />
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                placeholder="$0"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                placeholder="$10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setCategory('')
                    setMinPrice(0)
                    setMaxPrice(10000)
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <FiX size={20} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Products */}
        {recommendations.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">Recommended For You</h2>
                <p className="text-gray-600 mt-2">Personalized picks based on your interests</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section>
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'Search Results' : 'All Products'}
            </h2>
            {products.length > 0 && (
              <p className="text-gray-600">Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-16 text-center">
              <p className="text-gray-500 text-lg mb-4">No products found</p>
              <p className="text-gray-400">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
