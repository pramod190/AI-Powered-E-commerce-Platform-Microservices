"""
Domain models for API responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ProductRecommendation(BaseModel):
    """Product recommendation with score"""

    product_id: str
    score: float = Field(description="Recommendation score (0-1)")
    product: Optional[Dict[str, Any]] = None  # Enriched product data


class RecommendationResponse(BaseModel):
    """API response for recommendations"""

    user_id: str
    recommendations: List[ProductRecommendation]
    timestamp: datetime
    model_stats: Optional[Dict[str, Any]] = None


class RatingRequest(BaseModel):
    """Request to create/update a rating"""

    user_id: str = Field(description="User ID")
    product_id: str = Field(description="Product ID")
    rating: float = Field(ge=1, le=5, description="Rating value (1-5)")


class RatingResponse(BaseModel):
    """Response after creating/updating a rating"""

    user_id: str
    product_id: str
    rating: float
    timestamp: datetime


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    service: str
    timestamp: datetime
    model_ready: bool
    database_ready: bool


class ModelStatsResponse(BaseModel):
    """Model statistics"""

    is_trained: bool
    num_users: int
    num_products: int
    num_ratings: int
    sparsity: float
