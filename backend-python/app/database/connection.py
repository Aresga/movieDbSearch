import logging
from sqlmodel import create_engine
from ..config.settings import settings

logger = logging.getLogger(__name__)

class DatabaseConnection:
    """Manages database connection and engine."""

    def __init__(self):
        self.engine = None

    def create_engine(self):
        """Create and return the database engine."""
        if self.engine is None:
            try:
                self.engine = create_engine(settings.database_url)
                logger.info("Databas engine created successfully")
            except Exception as e:
                logger.error(f"Failed to create database engine: {e}")
                raise
        return self.engine

    def dispose(self):
        """Dispose of the database engine."""
        if self.engine:
            self.engine.dispose()
            logger.info("Database engine disposed")