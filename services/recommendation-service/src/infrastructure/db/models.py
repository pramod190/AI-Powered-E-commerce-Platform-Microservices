"""
Database Models for Recommendations
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Index, ForeignKey, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    """User model for storing user information"""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Product(Base):
    """Product model for storing product information"""

    __tablename__ = "products"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), index=True)
    category = Column(String(100), index=True)
    price = Column(Numeric(10, 2))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ratings = relationship("Rating", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name})>"


class Rating(Base):
    """User-Product Rating Model"""

    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id"), index=True)
    product_id = Column(String(36), ForeignKey("products.id"), index=True)
    rating = Column(Float, index=True)  # 1-5 scale
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="ratings")
    product = relationship("Product", back_populates="ratings")

    # Indexes for efficient queries
    __table_args__ = (
        Index("ix_rating_user_product", "user_id", "product_id", unique=True),
        Index("ix_rating_timestamp", "timestamp"),
    )

    def __repr__(self):
        return f"<Rating(user_id={self.user_id}, product_id={self.product_id}, rating={self.rating})>"
