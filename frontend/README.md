# React E-Commerce Frontend

A modern, production-ready React frontend for the scalable AI e-commerce platform with microservices architecture.

## 🎯 Features

- **User Authentication:**
  - Secure login and registration
  - JWT token management
  - Protected routes
  - Persistent authentication state

- **Product Discovery:**
  - Advanced product search with filters
  - Real-time category and price filtering
  - Product detail pages
  - Product ratings and reviews
  - Product recommendations using AI

- **Shopping Cart:**
  - Add/remove/update items
  - Real-time total calculation
  - Cart persistence in context
  - Quantity management

- **Checkout & Payment:**
  - Stripe payment integration
  - Shipping address collection
  - Order creation and tracking
  - Payment status handling

- **Recommendations:**
  - Personalized product recommendations
  - Similar products discovery
  - Popular products showcase
  - Rating-based suggestions

## 📋 Tech Stack

- **Framework:** React 18.2
- **Routing:** React Router v6
- **State Management:** Context API + useReducer
- **HTTP Client:** Axios with interceptors
- **Styling:** Tailwind CSS
- **Payment:** Stripe React SDK
- **Build Tool:** Vite
- **Icons:** React Icons

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Stripe account and API keys
- Backend services running on localhost (ports 4002-4007)

### Installation

1. **Clone and navigate to frontend:**
   ```bash
   cd frontend
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env`:**
   ```env
   VITE_API_URL=http://localhost:4002
   VITE_CART_SERVICE_URL=http://localhost:4003
   VITE_ORDER_SERVICE_URL=http://localhost:4004
   VITE_PAYMENT_SERVICE_URL=http://localhost:4005
   VITE_ANALYTICS_SERVICE_URL=http://localhost:4006
   VITE_RECOMMENDATION_SERVICE_URL=http://localhost:4007
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx              # Product listing & recommendations
│   │   ├── LoginPage.jsx             # User login
│   │   ├── RegisterPage.jsx          # User registration
│   │   ├── ProductDetailPage.jsx     # Product details & similar items
│   │   ├── CartPage.jsx              # Shopping cart
│   │   └── CheckoutPage.jsx          # Checkout & payment
│   ├── components/         # Reusable components
│   │   ├── Header.jsx                # Navigation header
│   │   ├── ProductCard.jsx           # Product display card
│   │   ├── Loading.jsx               # Loading spinners
│   │   └── Alert.jsx                 # Alert notifications
│   ├── context/           # Context for state management
│   │   ├── AuthContext.jsx           # Authentication state
│   │   └── CartContext.jsx           # Shopping cart state
│   ├── services/          # API service clients
│   │   ├── api.js                    # API endpoints for all services
│   │   └── auth.js                   # Authentication endpoints
│   ├── hooks/             # Custom React hooks
│   │   └── ProtectedRoute.jsx        # Route protection wrapper
│   ├── utils/             # Utility functions
│   │   └── helpers.js                # formatPrice, validate, parseJwt, etc.
│   ├── assets/            # Static assets
│   ├── index.css          # Tailwind CSS
│   ├── App.jsx            # Main app component
│   └── main.jsx           # React entry point
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
└── .env.example           # Environment template
```

## 🔑 Key Components

### Context Providers

**AuthContext:**
- Manages user authentication state
- Handles login/register/logout
- Persists tokens and user data
- Provides automatic token refresh

**CartContext:**
- Manages shopping cart state
- Handles item operations (add, remove, update)
- Calculates totals and item count
- Provides cart actions

### API Services

**productService:**
- `searchProducts()` - Search with filters
- `getProduct()` - Get product details
- `getProductsByCategory()` - Category browsing

**cartService:**
- `getCart()` - Fetch user cart
- `addToCart()` - Add item to cart
- `updateCartItem()` - Update quantity
- `removeFromCart()` - Remove item
- `clearCart()` - Empty cart

**orderService:**
- `createOrder()` - Create new order
- `getOrders()` - List user orders
- `getOrder()` - Get order details
- `updateOrderStatus()` - Update status

**paymentService:**
- `createPaymentIntent()` - Create Stripe payment
- `getPaymentIntent()` - Get payment details

**recommendationService:**
- `getUserRecommendations()` - Get personalized recommendations
- `rateProduct()` - Submit rating
- `getSimilarProducts()` - Get similar items
- `getPopularProducts()` - Get popular items

## 🛠️ Development

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Run linter:
```bash
npm run lint
```

### Fix linting issues:
```bash
npm run lint:fix
```

## 🔌 API Integration

All API calls use Axios interceptors for:
- **Request:** Automatically adds JWT token from localStorage
- **Response:** Handles 401 errors by redirecting to login
- **Error Handling:** Consistent error response structure

### Making API Calls:

```javascript
import { productService } from './services/api'

// Search products
const response = await productService.searchProducts(
  'laptop',
  'electronics',
  500,
  1500
)

// Get recommendations
const recs = await recommendationService.getUserRecommendations(userId, 10)
```

## 🔐 Authentication Flow

1. **Registration:** User provides name, email, password
2. **Login:** User provides email and password
3. **Token Storage:** JWT stored in localStorage
4. **Protected Routes:** `ProtectedRoute` checks authentication
5. **Auto-Logout:** 401 responses trigger logout and redirect to login

## 🎨 Styling

Uses Tailwind CSS with custom utility classes:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.input-field` - Styled form inputs
- `.card` - Reusable card component
- `.container` - Max-width wrapper with padding

## 📦 Dependencies

### Core
- react 18.2
- react-dom 18.2
- react-router-dom 6.21

### API & Data
- axios 1.6
- @stripe/react-stripe-js 2.6
- @stripe/stripe-js 2.1

### UI
- tailwindcss 3.4
- react-icons 4.13

### Dev Tools
- vite 5.0
- postcss 8.4
- autoprefixer 10.4
- eslint 8.56

## 🐛 Common Issues

### 1. CORS Errors
**Solution:** Ensure backend services have CORS middleware enabled

### 2. Stripe Payment Fails
**Solution:** Verify Stripe public key in .env matches your account

### 3. 401 Unauthorized
**Solution:** Login first to get token, check token expiration

### 4. Products Not Loading
**Solution:** Ensure Product Service (4002) is running

### 5. Cart Data Lost on Refresh
**Solution:** Current implementation stores in memory. For persistence, add localStorage

## 🚀 Production Deployment

### Build optimization:
```bash
npm run build
```

### Deploy to Vercel:
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Deploy to Netlify:
1. Build: `npm run build`
2. Publish folder: `dist/`
3. Set environment variables in Netlify dashboard

## 📊 Performance Optimization

- Code splitting with React.lazy
- Image optimization with lazy loading
- Tailwind CSS purging unused styles
- Vite production optimization
- Gzip compression for API responses

## 🔄 Integration Points

### With Microservices:
- Product Service (4002): Search, filters, details
- Cart Service (4003): Cart operations
- Order Service (4004): Order creation/tracking
- Payment Service (4005): Stripe integration
- Recommendation Service (4007): AI recommendations

### Event-Driven Updates:
- Order status updates via polling/WebSocket (future)
- Real-time notifications (future)
- Analytics tracking (future)

## 📝 Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Order status WebSocket listener
- [ ] Product inventory live updates
- [ ] Search suggestions/autocomplete
- [ ] Wishlist functionality
- [ ] Order history with filters
- [ ] User profile management
- [ ] Address book
- [ ] Payment history
- [ ] Review system with photos
- [ ] Social sharing
- [ ] Dark mode support

## 📞 Support

For issues or questions:
1. Check the error message in browser console
2. Verify backend services are running
3. Check environment variable configuration
4. Review API service logs

## 📄 License

MIT License - See LICENSE file
