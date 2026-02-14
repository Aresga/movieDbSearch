import os
import logging
from sqlalchemy import text
from sentence_transformers import SentenceTransformer
from sqlalchemy.engine import Engine
from ..config.settings import settings

logger = logging.getLogger(__name__)

class dataBaseinit: 
    
    def __init__(self, engine: Engine):
        self.engine = engine

    def init_db(self):
        """Creates table and enables vector extension with metadata fields."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS movies (
                        id SERIAL PRIMARY KEY,
                        tmdb_id INTEGER UNIQUE,
                        title TEXT NOT NULL,
                        overview TEXT NOT NULL,
                        genres TEXT[],
                        tagline TEXT,
                        release_year INTEGER,
                        vote_average FLOAT,
                        vote_count INTEGER,
                        runtime INTEGER,
                        popularity FLOAT,
                        poster_path TEXT,
                        backdrop_path TEXT,
                        embedding vector(384)
                    )
                """))
                conn.commit()
            logger.info("Database initialized with metadata schema.")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise