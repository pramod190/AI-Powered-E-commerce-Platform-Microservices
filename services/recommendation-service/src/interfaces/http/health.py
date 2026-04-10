"""
Health Check Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from infrastructure.db.database import get_db_session
from infrastructure.db.rating_repository import RatingRepository
from infrastructure.http_client.product_service import ProductServiceClient
from infrastructure.http_client.order_service import OrderServiceClient
from domain.models import HealthResponse
from application.ml.collaborative_filtering import CollaborativeFilteringEngine

router = APIRouter(tags=["health"])

# Service clients
product_client = ProductServiceClient()
order_client = OrderServiceClient()


@router.get("/health", response_model=HealthResponse)
async def health_check(
    ml_engine: CollaborativeFilteringEngine = None,
    session: Session = Depends(get_db_session),
):
    """
    Health check endpoint

    Returns service health status and dependencies
    """
    try:
        # Check database
        user_count = RatingRepository.get_user_count(session)
        db_ready = user_count >= 0

        # Check ML model
        model_ready = ml_engine.is_trained if ml_engine else False

        return HealthResponse(
            status="healthy",
            service="recommendation-service",
            timestamp=datetime.utcnow(),
            model_ready=model_ready,
            database_ready=db_ready,
        )
    except Exception:
        return HealthResponse(
            status="unhealthy",
            service="recommendation-service",
            timestamp=datetime.utcnow(),
            model_ready=False,
            database_ready=False,
        )


@router.get("/ready")
async def ready_check():
    """Kubernetes readiness probe"""
    product_healthy = await product_client.health_check()
    order_healthy = await order_client.health_check()

    if product_healthy and order_healthy:
        return {"ready": True, "service": "recommendation-service"}
    else:
        return {"ready": False, "service": "recommendation-service"}
