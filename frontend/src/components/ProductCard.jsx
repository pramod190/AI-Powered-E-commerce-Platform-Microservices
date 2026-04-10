import React, { useState } from 'react'
import { FiShoppingCart, FiHeart, FiStar, FiCheck } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/helpers'
import { useCart } from '../context/CartContext'

export function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300">
        {/* Image Container */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-56 overflow-hidden">
          <img
            src={product.image || 'https://via.placeholder.com/300x250?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/300x250?text=No+Image')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Stock Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5">
          {/* Category */}
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            {product.category}
          </p>
          
          {/* Product Name */}
          <h3 className="font-bold text-base text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={`${
                    i < Math.round(product.rating || 4)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.reviews || 0})</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
            {product.description}
          </p>

          {/* Price & Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`p-2.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg ${
                added
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {added ? <FiCheck size={20} /> : <FiShoppingCart size={20} />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
