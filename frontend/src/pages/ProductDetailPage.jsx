import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService, recommendationService } from '../services/api'
import { LoadingPage } from '../components/Loading'
import { ProductCard } from '../components/ProductCard'
import { Alert } from '../components/Alert'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/helpers'
import { FiPlus, FiMinus, FiStar, FiArrowLeft, FiCheck, FiTruck } from 'react-icons/fi'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await productService.getProduct(id)
        setProduct(response.data.product || response.data)
        setError('')
      } catch (err) {
        setError('Failed to load product')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const response = await productService.searchProducts('', product?.category, 0, 10000)
        setSimilarProducts((response.data.data || []).filter(p => p.id !== id).slice(0, 4))
      } catch (err) {
        console.error('Failed to load similar products', err)
      }
    }

    if (product?.id) fetchSimilarProducts()
  }, [id, product])

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      setAdded(true)
      setSuccess('Added to cart successfully!')
      setTimeout(() => {
        setAdded(false)
        setSuccess('')
      }, 2000)
    }
  }

  if (loading) return <LoadingPage />

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Product not found</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <FiArrowLeft />
            Back to products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors"
        >
          <FiArrowLeft size={20} />
          Back to shopping
        </button>

        {/* Product Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-white rounded-xl shadow-md overflow-hidden h-96 lg:h-full">
            <img
              src={product.image || 'https://via.placeholder.com/500x500'}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/500x500?text=No+Image')}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                {product.category}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={20}
                      className={i < Math.round(product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">4.0/5 ({product.reviews || 0} reviews)</span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiCheck className="text-green-500" size={20} />
                  <span>Premium quality materials</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiTruck className="text-blue-500" size={20} />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiCheck className="text-green-500" size={20} />
                  <span>30-day money back guarantee</span>
                </div>
              </div>
            </div>

            {/* Purchase Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              {/* Price */}
              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-2">Price</p>
                <p className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `✓ ${product.stock} in stock` : 'Out of Stock'}
                </p>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <FiMinus size={18} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-0 focus:outline-none font-semibold"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
                  added
                    ? 'bg-green-500 text-white'
                    : product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                }`}
              >
                {added ? '✓ Added to Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
            
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={20}
                  className={i < Math.round(product.rating || 4) ? 'fill-yellow-400' : ''}
                />
              ))}
              <span className="text-gray-600">({product.reviews || 0} reviews)</span>
            </div>

            <p className="text-lg text-blue-600 font-semibold mb-4">
              {formatPrice(product.price)}
            </p>

            <p className="text-gray-600 mb-4 leading-relaxed">
              {product.description}
            </p>

            {product.category && (
              <p className="text-sm text-gray-500 mb-4">
                Category: <span className="font-medium">{product.category}</span>
              </p>
            )}

            {product.stock && (
              <p className="text-sm mb-4">
                In Stock: <span className="font-bold text-green-600">{product.stock} units</span>
              </p>
            )}
          </div>

          {/* Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <FiMinus size={20} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-16 text-center border-x border-gray-300 py-2"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <FiPlus size={20} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary text-lg"
              >
                Add to Cart
              </button>
            </div>

            {/* Rating Section */}
            {user && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Rate this product</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <FiStar
                        size={24}
                        className={star <= rating ? 'fill-yellow-400' : ''}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <button
                      onClick={handleRate}
                      className="ml-4 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Submit Rating
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
