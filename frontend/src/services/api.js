import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4002'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const productService = {
  // Primary: search endpoint with optional filters
  searchProducts: async (query = '', category = '', minPrice = 0, maxPrice = 10000, page = 1) => {
    const params = { page, limit: 12 }
    if (query && query.trim()) params.q = query.trim()
    if (category) params.category = category
    if (minPrice > 0) params.minPrice = minPrice
    if (maxPrice < 10000) params.maxPrice = maxPrice

    try {
      return await apiClient.get('/products/search', { params })
    } catch {
      // Fallback to /products if /search fails
      return await apiClient.get('/products', { params: { category, page, limit: 12 } })
    }
  },

  // Fetch all products (fallback)
  getAllProducts: () => apiClient.get('/products'),

  getProduct: (id) => apiClient.get(`/products/${id}`),

  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.patch(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
}

/* ── Cart Service ─────────────────────── */
const CART_SERVICE_URL = import.meta.env.VITE_CART_SERVICE_URL || 'http://localhost:4003'
const cartClient = axios.create({ baseURL: CART_SERVICE_URL, timeout: 10000 })
cartClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const cartService = {
  getCart: (userId) => cartClient.get(`/cart/${userId}`),
  addToCart: (userId, productId, quantity) =>
    cartClient.post(`/cart/${userId}/items`, { productId, quantity }),
  updateCartItem: (userId, productId, quantity) =>
    cartClient.put(`/cart/${userId}/items/${productId}`, { quantity }),
  removeFromCart: (userId, productId) =>
    cartClient.delete(`/cart/${userId}/items/${productId}`),
  clearCart: (userId) => cartClient.delete(`/cart/${userId}`),
}

/* ── Order Service ───────────────────── */
const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:4004'
const orderClient = axios.create({ baseURL: ORDER_SERVICE_URL, timeout: 10000 })
orderClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const orderService = {
  createOrder: (userId, cartId, shippingAddress) =>
    orderClient.post('/orders', { userId, cartId, shippingAddress }),
  getOrders: (userId) => orderClient.get(`/orders/user/${userId}`),
  getOrder: (orderId) => orderClient.get(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status) =>
    orderClient.patch(`/orders/${orderId}/status`, { status }),
}

/* ── Payment Service ─────────────────── */
const PAYMENT_SERVICE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:4005'
const paymentClient = axios.create({ baseURL: PAYMENT_SERVICE_URL, timeout: 10000 })
paymentClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const paymentService = {
  createPaymentIntent: (orderId, amount, currency = 'usd') =>
    paymentClient.post('/payments/intent', { orderId, amount, currency }),
  getPaymentIntent: (paymentId) => paymentClient.get(`/payments/${paymentId}`),
}

/* ── Recommendation Service ──────────── */
const RECOMMENDATION_SERVICE_URL = import.meta.env.VITE_RECOMMENDATION_SERVICE_URL || 'http://localhost:4007'
const recommendationClient = axios.create({ baseURL: RECOMMENDATION_SERVICE_URL, timeout: 10000 })
recommendationClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const recommendationService = {
  getUserRecommendations: (userId, n = 6) =>
    recommendationClient.get(`/recommendations/user/${userId}`, { params: { n } }),
  rateProduct: (userId, productId, rating) =>
    recommendationClient.post('/recommendations/rate', { userId, productId, rating }),
  getSimilarProducts: (productId, n = 5) =>
    recommendationClient.get(`/recommendations/product/${productId}`, { params: { n } }),
  getPopularProducts: (n = 6) =>
    recommendationClient.get('/recommendations/popular', { params: { n } }),
}

export default apiClient
