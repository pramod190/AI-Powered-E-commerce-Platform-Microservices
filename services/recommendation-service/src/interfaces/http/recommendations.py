"""
Recommendation Service Routes
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from config.settings import settings
from config.logger import logger
from infrastructure.db.database import get_db_session
from infrastructure.db.rating_repository import RatingRepository
from infrastructure.http_client.product_service import ProductServiceClient
from domain.models import (
    RecommendationResponse,
    ProductRecommendation,
    RatingRequest,
    RatingResponse,
    ModelStatsResponse,
)
from application.ml.collaborative_filtering import CollaborativeFilteringEngine

# Global ML engine
ml_engine = CollaborativeFilteringEngine()
product_client = ProductServiceClient()

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/user/{user_id}", response_model=RecommendationResponse)
async def get_user_recommendations(
    user_id: str,
    n: int = Query(settings.MAX_RECOMMENDATIONS, ge=1, le=50),
    session: Session = Depends(get_db_session),
):
    """
    Get product recommendations for a user

    Returns top N recommended products based on collaborative filtering
    """
    try:
        if not ml_engine.is_trained:
            raise HTTPException(
                status_code=503,
                detail="Recommendation model not ready. Please try again later.",
            )

        # Get recommendations from ML engine
        recommendations_data = ml_engine.get_recommendations(user_id, n)

        # Enrich with product data
        recommendations = []
        for product_id, score in recommendations_data:
            product_data = await product_client.get_product(product_id)
            recommendations.append(
                ProductRecommendation(
                    product_id=product_id,
                    score=score,
                    product=product_data,
                )
            )

        logger.info(
            f"Generated {len(recommendations)} recommendations for user {user_id}"
        )

        return RecommendationResponse(
            user_id=user_id,
            recommendations=recommendations,
            timestamp=datetime.utcnow(),
            model_stats=ml_engine.get_model_stats(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting recommendations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")


@router.post("/rate", response_model=RatingResponse)
async def rate_product(
    request: RatingRequest,
    session: Session = Depends(get_db_session),
):
    """
    Rate a product

    Creates or updates a user rating for a product
    """
    try:
        rating = RatingRepository.create_rating(
            session, request.user_id, request.product_id, request.rating
        )

        logger.info(
            f"User {request.user_id} rated product {request.product_id}: {request.rating}"
        )

        return RatingResponse(
            user_id=rating.user_id,
            product_id=rating.product_id,
            rating=rating.rating,
            timestamp=rating.timestamp,
        )

    except Exception as e:
        logger.error(f"Error creating rating: {e}")
        raise HTTPException(status_code=500, detail="Failed to create rating")


@router.get("/product/{product_id}", response_model=List[ProductRecommendation])
async def get_similar_products(
    product_id: str,
    n: int = Query(5, ge=1, le=20),
):
    """
    Get products similar to a given product

    Returns products with similar user ratings
    """
    try:
        if not ml_engine.is_trained:
            return []

        similar_data = ml_engine.get_similar_products(product_id, n)

        # Enrich with product data
        similar_products = []
        for sim_product_id, score in similar_data:
            product_data = await product_client.get_product(sim_product_id)
            similar_products.append(
                ProductRecommendation(
                    product_id=sim_product_id,
                    score=score,
                    product=product_data,
                )
            )

        logger.info(f"Found {len(similar_products)} similar products for {product_id}")

        return similar_products

    except Exception as e:
        logger.error(f"Error getting similar products for {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get similar products")


@router.get("/popular", response_model=List[ProductRecommendation])
async def get_popular_products(
    n: int = Query(settings.MAX_RECOMMENDATIONS, ge=1, le=50),
    session: Session = Depends(get_db_session),
):
    """
    Get most popular products

    Returns products with highest average ratings
    """
    try:
        if not ml_engine.is_trained:
            return []

        popular_data = ml_engine._get_popular_products(n)

        # Enrich with product data
        popular_products = []
        for product_id, score in popular_data:
            product_data = await product_client.get_product(product_id)
            popular_products.append(
                ProductRecommendation(
                    product_id=product_id,
                    score=score,
                    product=product_data,
                )
            )

        logger.info(f"Returned {len(popular_products)} popular products")

        return popular_products

    except Exception as e:
        logger.error(f"Error getting popular products: {e}")
        raise HTTPException(status_code=500, detail="Failed to get popular products")


@router.get("/stats", response_model=ModelStatsResponse)
async def get_model_statistics():
    """Get ML model statistics"""
    stats = ml_engine.get_model_stats()
    return ModelStatsResponse(**stats)


@router.post("/train")
async def train_model(
    session: Session = Depends(get_db_session),
):
    """
    Manually trigger model training

    Fetches recent rating data and retrains the ML model
    """
    try:
        logger.info("Starting model training...")

        # Get training data
        ratings_data = RatingRepository.get_recent_ratings(
            session, settings.TRAINING_DATA_DAYS
        )

        if not ratings_data:
            logger.warning("No training data available")
            raise HTTPException(status_code=400, detail="No training data available")

        # Train model
        success = ml_engine.train(ratings_data)

        if not success:
            raise HTTPException(status_code=500, detail="Model training failed")

        stats = ml_engine.get_model_stats()
        logger.info(f"Model training completed. Stats: {stats}")

        return {
            "message": "Model training completed successfully",
            "stats": stats,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail="Model training failed")
