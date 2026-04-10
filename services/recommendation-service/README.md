# Recommendation Service

AI-powered product recommendation engine using collaborative filtering with FastAPI and machine learning.

**Port:** 4007

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│               Recommendation Service (Port 4007)             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            FastAPI HTTP Endpoints                      │ │
│  │                                                        │ │
│  │  GET /recommendations/user/{user_id}                  │ │
│  │  POST /recommendations/rate                           │ │
│  │  GET /recommendations/product/{product_id}            │ │
│  │  GET /recommendations/popular                         │ │
│  │  GET /recommendations/stats                           │ │
│  │  POST /recommendations/train                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                       ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Collaborative Filtering Engine (scikit-learn)        │ │
│  │                                                        │ │
│  │  - User-Item Matrix (normalized ratings)              │ │
│  │  - Item Similarity Matrix (cosine distance)           │ │
│  │  - Score Calculation & Ranking                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                       ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │    PostgreSQL Database (Rating Storage)                │ │
│  │                                                        │ │
│  │    users:     id, email, created_at                   │ │
│  │    products:  id, name, category, price               │ │
│  │    ratings:   user_id, product_id, rating, timestamp  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
        ↑                                        ↑
   Order Service                          Product Service
   (fetch orders)                     (enrich recommendations)
```

## Key Features

### 1. **Collaborative Filtering**
- Item-based collaborative filtering using cosine similarity
- Automatically infers product preferences from rating patterns
- Handles new users with fallback to popular items
- Sparse matrix optimization for large datasets

### 2. **ML Model**
- Trained on user rating history (default: 90 days)
- Auto-trains on service startup
- Manual training trigger endpoint
- Model statistics and sparsity monitoring

### 3. **Rating System**
- Users rate products on 1-5 scale
- Stores full rating history with timestamps
- Implicit feedback from order history
- Unique user-product rating constraint

### 4. **API Features**
- Personalized recommendations per user
- Similar product discovery
- Popular product recommendations
- Model statistics endpoint
- Health checks with dependency status

### 5. **Production Ready**
- PostgreSQL persistence
- Async HTTP client with timeout handling
- Error handling and logging
- Dependency injection (FastAPI)
- Clean architecture (Domain → Application → Infrastructure)

## Setup

### 1. Install Python & Dependencies

```bash
# Requires Python 3.10+
python --version

# Install dependencies
pip install -r requirements.txt
# OR using pyproject.toml
pip install .
```

**Key Libraries:**
- `fastapi` - Web framework
- `sqlalchemy` - ORM
- `psycopg2` - PostgreSQL driver
- `pandas` - Data manipulation
- `scikit-learn` - ML algorithms
- `numpy` - Numerical computing

### 2. Setup PostgreSQL Database

```bash
# Option 1: Docker
docker run -d \
  --name postgres-rec \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=recommendations \
  -p 5432:5432 \
  postgres:15

# Option 2: Local PostgreSQL
# Create database manually
createdb recommendations
```

### 3. Configure Environment

Create `.env` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/recommendations
PRODUCT_SERVICE_URL=http://localhost:4002
ORDER_SERVICE_URL=http://localhost:4004
PORT=4007
DEBUG=True
LOG_LEVEL=INFO
```

### 4. Initialize Database

Tables are auto-created on first run:

```bash
python src/server.py
```

### 5. Start Service

```bash
# Development with auto-reload
python src/server.py

# Or direct uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 4007 --reload
```

Service available at: http://localhost:4007

## API Endpoints

### Get Recommendations for User

```bash
GET /recommendations/user/{user_id}?n=10
```

**Response:**
```json
{
  "user_id": "user123",
  "recommendations": [
    {
      "product_id": "prod456",
      "score": 0.87,
      "product": {
        "id": "prod456",
        "name": "Product Name",
        "price": 29.99,
        "category": "electronics"
      }
    }
  ],
  "timestamp": "2024-01-15T12:00:00",
  "model_stats": {
    "is_trained": true,
    "num_users": 150,
    "num_products": 500,
    "num_ratings": 2341,
    "sparsity": 0.97
  }
}
```

### Rate a Product

```bash
POST /recommendations/rate
Content-Type: application/json

{
  "user_id": "user123",
  "product_id": "prod456",
  "rating": 4.5
}
```

**Response:**
```json
{
  "user_id": "user123",
  "product_id": "prod456",
  "rating": 4.5,
  "timestamp": "2024-01-15T12:00:00"
}
```

### Get Similar Products

```bash
GET /recommendations/product/{product_id}?n=5
```

**Response:**
```json
[
  {
    "product_id": "prod789",
    "score": 0.92,
    "product": {
      "id": "prod789",
      "name": "Similar Product",
      "price": 34.99
    }
  }
]
```

### Get Popular Products

```bash
GET /recommendations/popular?n=10
```

**Response:**
```json
[
  {
    "product_id": "prod111",
    "score": 4.8,
    "product": {
      "id": "prod111",
      "name": "Best Seller",
      "price": 19.99
    }
  }
]
```

### Get Model Statistics

```bash
GET /recommendations/stats
```

**Response:**
```json
{
  "is_trained": true,
  "num_users": 150,
  "num_products": 500,
  "num_ratings": 2341,
  "sparsity": 0.97
}
```

### Train Model Manually

```bash
POST /recommendations/train
```

**Response:**
```json
{
  "message": "Model training completed successfully",
  "stats": {
    "is_trained": true,
    "num_users": 150,
    "num_products": 500,
    "num_ratings": 2341,
    "sparsity": 0.97
  }
}
```

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "recommendation-service",
  "timestamp": "2024-01-15T12:00:00",
  "model_ready": true,
  "database_ready": true
}
```

## Data Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    product_id VARCHAR(36) NOT NULL REFERENCES products(id),
    rating FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_timestamp (timestamp)
);
```

## Collaborative Filtering Algorithm

### 1. User-Item Matrix
```
        Product1  Product2  Product3
User1      4         0         5
User2      0         3         4
User3      5         4         0
```

### 2. Item Similarity (Cosine Distance)
```
similarity(Product1, Product2) = 0.92
similarity(Product1, Product3) = 0.87
similarity(Product2, Product3) = 0.78
```

### 3. Recommendation Score
```
For User1, unrated Product2:
score = sum(user_ratings * item_similarity)
      = (4 * 0.92) + (5 * 0.87)
      = 3.68 + 4.35
      = 8.03
```

### 4. Ranking
Sort by score and return top N products

## Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| MIN_RATINGS_PER_USER | 2 | Minimum ratings required for user |
| MIN_RATINGS_PER_PRODUCT | 2 | Minimum ratings required for product |
| MAX_RECOMMENDATIONS | 10 | Max recommendations per request |
| SIMILARITY_THRESHOLD | 0.0 | Minimum similarity score (0-1) |
| TRAINING_DATA_DAYS | 90 | Days of data for model training |
| SIMILARITY_METRIC | cosine | Similarity calculation method |

## Performance Considerations

### Time Complexity
- Model Training: O(n × m²) where n = users, m = products
- Recommendation: O(m²) - matrix multiplication
- Similar Products: O(m) - lookup and sorting

### Space Complexity
- User-Item Matrix: O(n × m)
- Similarity Matrix: O(m²)

### Optimization Tips
- Use MIN_RATINGS_PER_USER/PRODUCT to reduce matrix sparsity
- Increase SIMILARITY_THRESHOLD to filter low-quality recommendations
- Reduce TRAINING_DATA_DAYS for fresher data
- Implement incremental updates instead of full retraining

## Integration with Other Services

### Product Service
Fetches product details to enrich recommendations:
```
/recommendations/user/123
  ↓
Get prediction: [prod456, prod789, prod111]
  ↓
Call Product Service: GET /products/{id}
  ↓
Enrich and return with full product data
```

### Order Service
Optionally seed ratings from order history:
```
GET /orders?user_id=123
  ↓
Extract purchased products
  ↓
Create implicit ratings (implied satisfaction)
  ↓
Store in recommendations database
```

## Development

### Running Tests

```bash
# Install dev dependencies
pip install .[dev]

# Run tests
pytest tests/

# With coverage
pytest --cov=src tests/
```

### Code Quality

```bash
# Format code
black src/

# Lint
flake8 src/

# Type checking
mypy src/
```

## Production Deployment

### Database Persistence
```python
# Use managed PostgreSQL (AWS RDS, GCP Cloud SQL)
DATABASE_URL=postgresql://user:pwd@db.example.com/recommendations
DEBUG=False
LOG_LEVEL=INFO
```

### Model Caching
```python
# Store trained model in file/S3 for faster startup
# Or use Redis for distributed cache
```

### Scaling
```python
# Horizontal scaling with load balancer
# Multiple instances sharing PostgreSQL
# Periodic model retraining (cron job)
```

### Monitoring
```python
# Track recommendation quality metrics
# Monitor model drift (sparsity, num_ratings)
# Alert on training failures
```

## Troubleshooting

### Issue: "Model not ready"

**Cause:** Not enough training data

**Solution:**
```bash
# Create test ratings
curl -X POST http://localhost:4007/recommendations/rate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "product_id": "prod456",
    "rating": 4.5
  }'

# Manually train
curl -X POST http://localhost:4007/recommendations/train
```

### Issue: "Product not found"

**Cause:** Product Service not running or integration error

**Solution:**
```bash
# Check Product Service health
curl http://localhost:4002/health

# Verify PRODUCT_SERVICE_URL in .env
# Check network connectivity
```

### Issue: Recommendations are poor quality

**Cause:** Insufficient training data or wrong parameters

**Solution:**
```env
# Lower minimum ratings requirement
MIN_RATINGS_PER_USER=1
MIN_RATINGS_PER_PRODUCT=1

# Retrain model
POST /recommendations/train
```

## References

- [Collaborative Filtering](https://en.wikipedia.org/wiki/Collaborative_filtering)
- [Scikit-learn Documentation](https://scikit-learn.org/)
- [FastAPI Guide](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [Recommendation Systems](https://developers.google.com/machine-learning/recommendation-systems)
