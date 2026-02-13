import logging
from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy import case
from sqlalchemy.engine import Engine
from sentence_transformers import SentenceTransformer
from app.database.models import Movie 

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self, engine: Engine, model: SentenceTransformer):
        self.engine = engine
        self.model = model

    def search_movies(self, q: str, limit: int = 10):
        if not q:
            raise HTTPException(status_code=400, detail="Query string 'q' is required")

        try:
            query_vec = self.model.encode(q).tolist()

            with Session(self.engine) as session:
                raw_distance = Movie.embedding.cosine_distance(query_vec)
                
                # Logic: IF (Movie.title ILIKE q) THEN subtract 0.2 ELSE subtract 0.0
                # ilike makes it case-insensitive (exmaple "matrix" matches "The Matrix")
                title_boost = case(
                    (Movie.title.ilike(q), 0.2), # Exact match boost
                    (Movie.title.ilike(f"%{q}%"), 0.1), # Partial match boost
                    else_=0.0
                )

                final_distance = raw_distance - title_boost

                statement = (
                    select(Movie, final_distance) # Select the boosted distance
                    .where(Movie.overview != None)
                    .order_by(final_distance)     # Sort by the boosted score
                    .limit(limit)
                )

                results = session.exec(statement).all()

            return {
                "query": q,
                "results": [
                    {
                        "title": movie.title,
                        "tmdb_id": movie.tmdb_id,
                        "overview": movie.overview,
                        "tagline": movie.tagline,
                        "poster_path": movie.poster_path,
                        "release_year": movie.release_year,
                        "genre": movie.genres,
                        "vote_average": movie.vote_average,
                        "vote_count": movie.vote_count,
                        "backdrop_path": movie.backdrop_path,
                        "similarity_score": round(min(1 - dist, 1.0), 4)
                    }
                    for movie, dist in results
                ]
            }

        except Exception as e:
            logger.error(f"Failed to search movies: {e}")
            raise HTTPException(status_code=500, detail="Search service unavailable")
