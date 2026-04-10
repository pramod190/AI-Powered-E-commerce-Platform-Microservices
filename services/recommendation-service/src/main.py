"""
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.settings import settings
from config.logger import logger
from infrastructure.db.database import db
from infrastructure.db.rating_repository import RatingRepository
from interfaces.http.recommendations import router as recommendations_router, ml_engine
from interfaces.http.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager"""
    # Startup
    logger.info(f"Starting {settings.SERVICE_NAME}...")
    try:
        db.init_db()
        
        # Train model on startup
        logger.info("Training recommendation model on startup...")
        session = db.get_session()
        try:
            ratings_data = RatingRepository.get_recent_ratings(
                session, settings.TRAINING_DATA_DAYS
            )
            if ratings_data:
                ml_engine.train(ratings_data)
                logger.info("Model training completed")
            else:
                logger.warning("No rating data available for model training")
        finally:
            session.close()
    except Exception as e:
        logger.error(f"Startup error: {e}")

    yield

    # Shutdown
    logger.info("Shutting down...")
    db.close()


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title=settings.SERVICE_NAME,
        description="AI Recommendation Service using Collaborative Filtering",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(health_router)
    app.include_router(recommendations_router)

    # Root endpoint
    @app.get("/")
    async def root():
        return {
            "service": settings.SERVICE_NAME,
            "version": "1.0.0",
            "endpoints": {
                "health": "/health",
                "recommendations": "/recommendations/user/{user_id}",
                "rate": "/recommendations/rate",
                "similar": "/recommendations/product/{product_id}",
                "popular": "/recommendations/popular",
                "stats": "/recommendations/stats",
                "train": "/recommendations/train",
            },
        }

    return app


app = create_app()
