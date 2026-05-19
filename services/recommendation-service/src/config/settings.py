"""
Recommendation Service Environment Configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Settings for Recommendation Service"""

    # Service
    SERVICE_NAME: str = "recommendation-service"
    PORT: int = 4007
    HOST: str = "0.0.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/recommendations"

    # External Services
    PRODUCT_SERVICE_URL: str = "http://localhost:4002"
    ORDER_SERVICE_URL: str = "http://localhost:4004"

    # ML Configuration
    MIN_RATINGS_PER_USER: int = 2  # Minimum ratings required for user
    MIN_RATINGS_PER_PRODUCT: int = 2  # Minimum ratings required for product
    MAX_RECOMMENDATIONS: int = 10  # Maximum recommendations to return
    SIMILARITY_THRESHOLD: float = 0.0  # Minimum similarity score
    TRAINING_DATA_DAYS: int = 90  # Days of data to use for training

    # Similarity metric
    SIMILARITY_METRIC: str = "cosine"  # cosine, euclidean, manhattan

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
