import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'

export function CartPage() {
  const cart = useCart()
  const navigate = useNavigate()

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="container max-w-md mx-auto text-center">
          <div className="mb-8">
            <FiShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Your cart is empty</h1>
          <p className="text-gray-600 text-lg mb-8">Add some products to get started!</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <FiArrowLeft size={20} />
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const subtotal = cart.total || 0
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <FiArrowLeft size={20} />
            Continue Shopping
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.productId} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-6">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/120x120?text=No+Image'}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg shadow-sm"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/120x120?text=No+Image')}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-3xl font-bold text-blue-600 mb-4">
                      {formatPrice(Number(item.price))}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            cart.updateItem(item.productId, item.quantity - 1)
                          }
                          className="p-3 hover:bg-gray-100 transition-colors"
                        >
                          <FiMinus size={18} className="text-gray-700" />
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-800 py-2 bg-gray-50">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            cart.updateItem(item.productId, item.quantity + 1)
                          }
                          className="p-3 hover:bg-gray-100 transition-colors"
                        >
                          <FiPlus size={18} className="text-gray-700" />
                        </button>
                      </div>

                      {/* Total for this item */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => cart.removeItem(item.productId)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Summary</h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Tax (estimated)</span>
                  <span className="font-semibold">{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 mb-4"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </button>

              {/* Trust Badge */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>✓ Secure checkout</p>
                <p>✓ Free shipping on orders over $50</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
