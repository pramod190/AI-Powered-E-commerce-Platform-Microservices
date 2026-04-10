"""
Database Connection and Session Management
"""

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, Session
from config.settings import settings
from config.logger import logger
from infrastructure.db.models import Base


class Database:
    """Database connection manager"""

    def __init__(self, database_url: str = settings.DATABASE_URL):
        self.engine = create_engine(
            database_url,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )

    def init_db(self):
        """Initialize database tables"""
        try:
            inspector = inspect(self.engine)
            existing_tables = inspector.get_table_names()

            if not existing_tables:
                logger.info("Creating database tables...")
                Base.metadata.create_all(bind=self.engine)
                logger.info("Database tables created successfully")
            else:
                logger.info(f"Database tables already exist: {existing_tables}")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise

    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()

    def close(self):
        """Close database connection"""
        self.engine.dispose()
        logger.info("Database connection closed")


# Global database instance
db = Database()


def get_db_session() -> Session:
    """Dependency for FastAPI to get database session"""
    session = db.get_session()
    try:
        yield session
    finally:
        session.close()
