"""
Repository for managing ratings data
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from infrastructure.db.models import Rating, User, Product
from config.logger import logger
from typing import List, Tuple, Optional


class RatingRepository:
    """Repository for rating operations"""

    @staticmethod
    def create_rating(
        session: Session, user_id: str, product_id: str, rating: float
    ) -> Rating:
        """Create or update a rating"""
        # Check if rating exists
        existing_rating = (
            session.query(Rating)
            .filter(Rating.user_id == user_id, Rating.product_id == product_id)
            .first()
        )

        if existing_rating:
            existing_rating.rating = rating
            existing_rating.timestamp = datetime.utcnow()
            logger.info(f"Updated rating for user {user_id} on product {product_id}")
        else:
            existing_rating = Rating(
                user_id=user_id, product_id=product_id, rating=rating
            )
            session.add(existing_rating)
            logger.info(f"Created rating for user {user_id} on product {product_id}")

        session.commit()
        return existing_rating

    @staticmethod
    def get_user_ratings(session: Session, user_id: str) -> List[Tuple[str, float]]:
        """Get all ratings for a user"""
        ratings = (
            session.query(Rating.product_id, Rating.rating)
            .filter(Rating.user_id == user_id)
            .all()
        )
        return [(r[0], float(r[1])) for r in ratings]

    @staticmethod
    def get_product_ratings(session: Session, product_id: str) -> List[Tuple[str, float]]:
        """Get all ratings for a product"""
        ratings = (
            session.query(Rating.user_id, Rating.rating)
            .filter(Rating.product_id == product_id)
            .all()
        )
        return [(r[0], float(r[1])) for r in ratings]

    @staticmethod
    def get_all_ratings_matrix(session: Session) -> List[dict]:
        """Get all ratings as a matrix format for ML training"""
        ratings = session.query(
            Rating.user_id, Rating.product_id, Rating.rating, Rating.timestamp
        ).all()

        return [
            {
                "user_id": r[0],
                "product_id": r[1],
                "rating": float(r[2]),
                "timestamp": r[3],
            }
            for r in ratings
        ]

    @staticmethod
    def get_recent_ratings(session: Session, days: int = 90) -> List[dict]:
        """Get ratings from last N days for training data"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        ratings = session.query(
            Rating.user_id, Rating.product_id, Rating.rating
        ).filter(Rating.timestamp >= cutoff_date).all()

        return [
            {
                "user_id": r[0],
                "product_id": r[1],
                "rating": float(r[2]),
            }
            for r in ratings
        ]

    @staticmethod
    def get_user_count(session: Session) -> int:
        """Get total number of users with ratings"""
        return session.query(func.count(func.distinct(Rating.user_id))).scalar()

    @staticmethod
    def get_product_count(session: Session) -> int:
        """Get total number of products with ratings"""
        return session.query(func.count(func.distinct(Rating.product_id))).scalar()
