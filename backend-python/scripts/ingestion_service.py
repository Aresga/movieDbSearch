import os
import ast
import logging
import pandas as pd
from sqlalchemy import text
from sentence_transformers import SentenceTransformer
from sqlalchemy.engine import Engine
from ..config.settings import settings

logger = logging.getLogger(__name__)

class DataIngestionService:
    """Service responsible for database initialization and data ingestion."""

    def __init__(self, engine: Engine, model: SentenceTransformer):
        self.engine = engine
        self.model = model

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
                        release_year INTEGER,
                        vote_average FLOAT,
                        vote_count INTEGER,
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

    def ingest_data(self):
        """Ingests filtered TMDB data with metadata and embeddings."""
        try:
            with self.engine.connect() as conn:
                count = conn.execute(text("SELECT COUNT(*) FROM movies")).scalar()
                if count > 0:
                    logger.info(f"Skipping ingestion: {count} movies already in DB.")
                    return

            logger.info("Reading and filtering CSV...")
            df = pd.read_csv(settings.csv_path, low_memory=False)

            # 1. Clean and Filter
            df['vote_count'] = pd.to_numeric(df['vote_count'], errors='coerce').fillna(0)
            df['vote_average'] = pd.to_numeric(df['vote_average'], errors='coerce').fillna(0)
            
            # Apply your high-quality filter (10+ votes and has overview)
            mask = (df['vote_count'] >= 10) & (df['overview'].str.len() > 20)
            df = df[mask].copy()

            # 2. Data Transformation
            def parse_genres(genre_str):
                try:
                    # Converts "[{'name': 'Action'}, ...]" to ["Action", ...]
                    genres_list = ast.literal_eval(genre_str)
                    return [g['name'] for g in genres_list]
                except:
                    return []

            df['genres_list'] = df['genres'].apply(parse_genres)
            df['year'] = pd.to_datetime(df['release_date'], errors='coerce').dt.year.fillna(0).astype(int)

            logger.info(f"Processing {len(df)} movies in batches...")

            # 3. Batch Ingestion
            batch_size = 500
            for i in range(0, len(df), batch_size):
                batch = df.iloc[i : i + batch_size]
                
                # Generate embeddings for the current batch
                embeddings = self.model.encode(batch['overview'].tolist())

                data = []
                for (_, row), emb in zip(batch.iterrows(), embeddings):
                    data.append({
                        "tmdb_id": int(row['id']),
                        "title": row['title'],
                        "overview": row['overview'],
                        "genres": row['genres_list'],
                        "release_year": int(row['year']),
                        "vote_average": float(row['vote_average']),
                        "vote_count": int(row['vote_count']),
                        "poster_path": row['poster_path'] if pd.notna(row['poster_path']) else None,
                        "embedding": emb.tolist()
                    })

                # Bulk Insert using bind parameters
                with self.engine.connect() as conn:
                    conn.execute(
                        text("""
                            INSERT INTO movies (tmdb_id, title, overview, genres, release_year, vote_average, vote_count, poster_path, embedding) 
                            VALUES (:tmdb_id, :title, :overview, :genres, :release_year, :vote_average, :vote_count, :poster_path, :embedding)
                            ON CONFLICT (tmdb_id) DO NOTHING
                        """),
                        data
                    )
                    conn.commit()
                
                logger.info(f"Progress: {i + len(batch)} / {len(df)}")

            logger.info("Ingestion complete.")
        except Exception as e:
            logger.error(f"Failed to ingest data: {e}")
            raise
