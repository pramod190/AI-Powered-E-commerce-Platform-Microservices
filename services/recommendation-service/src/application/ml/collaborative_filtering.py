"""
Collaborative Filtering Recommendation Engine
Uses Item-Based Collaborative Filtering with cosine similarity
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from config.settings import settings
from config.logger import logger


class CollaborativeFilteringEngine:
    """Recommendation engine using collaborative filtering"""

    def __init__(self):
        self.user_item_matrix = None
        self.item_similarity_matrix = None
        self.product_ids = []
        self.user_ids = []
        self.is_trained = False

    def train(self, ratings_data: List[Dict]) -> bool:
        """
        Train the model with rating data

        Args:
            ratings_data: List of dicts with user_id, product_id, rating

        Returns:
            bool: True if training successful
        """
        try:
            if not ratings_data:
                logger.warning("No rating data provided for training")
                return False

            df = pd.DataFrame(ratings_data)

            # Filter out users and products with too few ratings
            user_counts = df["user_id"].value_counts()
            product_counts = df["product_id"].value_counts()

            valid_users = user_counts[
                user_counts >= settings.MIN_RATINGS_PER_USER
            ].index
            valid_products = product_counts[
                product_counts >= settings.MIN_RATINGS_PER_PRODUCT
            ].index

            df = df[
                (df["user_id"].isin(valid_users))
                & (df["product_id"].isin(valid_products))
            ]

            if df.empty:
                logger.warning("No valid ratings after filtering")
                return False

            # Create user-item matrix
            self.user_item_matrix = df.pivot_table(
                index="user_id",
                columns="product_id",
                values="rating",
                fill_value=0,
            )

            self.user_ids = self.user_item_matrix.index.tolist()
            self.product_ids = self.user_item_matrix.columns.tolist()

            # Calculate item similarity matrix
            if settings.SIMILARITY_METRIC == "cosine":
                self.item_similarity_matrix = cosine_similarity(
                    self.user_item_matrix.T
                )
            elif settings.SIMILARITY_METRIC == "euclidean":
                # Convert euclidean distance to similarity (1 / (1 + distance))
                distances = euclidean_distances(self.user_item_matrix.T)
                self.item_similarity_matrix = 1 / (1 + distances)
            else:
                logger.error(f"Unknown similarity metric: {settings.SIMILARITY_METRIC}")
                return False

            # Set diagonal to 0 (no self-similarity)
            np.fill_diagonal(self.item_similarity_matrix, 0)

            self.is_trained = True
            logger.info(
                f"Model trained successfully. "
                f"Users: {len(self.user_ids)}, Products: {len(self.product_ids)}"
            )
            return True

        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False

    def get_recommendations(
        self, user_id: str, n_recommendations: int = None
    ) -> List[Tuple[str, float]]:
        """
        Get product recommendations for a user

        Args:
            user_id: User ID to get recommendations for
            n_recommendations: Number of recommendations to return

        Returns:
            List of (product_id, score) tuples
        """
        if not self.is_trained:
            logger.warning("Model not trained yet")
            return []

        n = n_recommendations or settings.MAX_RECOMMENDATIONS

        try:
            # Check if user exists
            if user_id not in self.user_ids:
                logger.info(f"User {user_id} not in training data, returning popular items")
                return self._get_popular_products(n)

            user_idx = self.user_ids.index(user_id)
            user_ratings = self.user_item_matrix.iloc[user_idx].values

            # Calculate recommendation scores
            scores = np.dot(user_ratings, self.item_similarity_matrix)

            # Get unrated products
            unrated_products = np.where(user_ratings == 0)[0]

            if len(unrated_products) == 0:
                logger.info(f"User {user_id} has rated all products")
                return []

            # Get scores for unrated products
            unrated_scores = scores[unrated_products]
            unrated_indices = unrated_products[np.argsort(-unrated_scores)[:n]]

            # Build recommendations
            recommendations = []
            for idx in unrated_indices:
                product_id = self.product_ids[idx]
                score = float(scores[idx])

                if score >= settings.SIMILARITY_THRESHOLD:
                    recommendations.append((product_id, score))

            return recommendations[:n]

        except Exception as e:
            logger.error(f"Error getting recommendations for user {user_id}: {e}")
            return []

    def _get_popular_products(self, n: int) -> List[Tuple[str, float]]:
        """Get most popular products as fallback"""
        try:
            if self.user_item_matrix is None:
                return []

            # Calculate average rating per product
            avg_ratings = self.user_item_matrix.mean()
            top_products = avg_ratings.nlargest(n)

            return list(zip(top_products.index.tolist(), top_products.values.tolist()))
        except Exception as e:
            logger.error(f"Error getting popular products: {e}")
            return []

    def get_similar_products(
        self, product_id: str, n_similar: int = 5
    ) -> List[Tuple[str, float]]:
        """Get products similar to a given product"""
        if not self.is_trained:
            logger.warning("Model not trained yet")
            return []

        try:
            if product_id not in self.product_ids:
                logger.warning(f"Product {product_id} not in training data")
                return []

            product_idx = self.product_ids.index(product_id)
            similarities = self.item_similarity_matrix[product_idx]

            # Get top similar products
            top_indices = np.argsort(-similarities)[:n_similar]

            similar_products = [
                (self.product_ids[idx], float(similarities[idx]))
                for idx in top_indices
                if similarities[idx] > settings.SIMILARITY_THRESHOLD
            ]

            return similar_products
        except Exception as e:
            logger.error(f"Error getting similar products for {product_id}: {e}")
            return []

    def get_model_stats(self) -> Dict:
        """Get model statistics"""
        return {
            "is_trained": self.is_trained,
            "num_users": len(self.user_ids) if self.is_trained else 0,
            "num_products": len(self.product_ids) if self.is_trained else 0,
            "num_ratings": (
                int(np.count_nonzero(self.user_item_matrix))
                if self.is_trained
                else 0
            ),
            "sparsity": (
                float(1 - np.count_nonzero(self.user_item_matrix) / self.user_item_matrix.size)
                if self.is_trained
                else 0
            ),
        }
