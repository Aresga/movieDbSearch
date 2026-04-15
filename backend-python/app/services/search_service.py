import logging
from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy import case
from sqlalchemy.engine import Engine
from sentence_transformers import SentenceTransformer
from app.database.models import Movie, UserSearchAction 

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self, engine: Engine, model: SentenceTransformer):
        self.engine = engine
        self.model = model

    def search_movies(self, q: str, page: int = 1, size: int = 10, userId: str | None = None):
        if not q:
            raise HTTPException(status_code=400, detail="Query string 'q' is required")

        try:
            query_vec = self.model.encode(q).tolist()
            offset = (page - 1) * size

            with Session(self.engine) as session:
                
                if userId:
                    try:
                        session.add(UserSearchAction(
                            user_id=userId,
                            query=q,
                            embedding=query_vec
                        ))
                        session.commit()
                    except Exception as e:
                        logger.error(f"Failed to log search action: {e}")
                        session.rollback()

                raw_distance = Movie.embedding.cosine_distance(query_vec)
                
                # Logic: IF (Movie.title ILIKE q) THEN subtract 0.2 ELSE subtract 0.0
                # ilike makes it case-insensitive (exmaple "matrix" matches "The Matrix"
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
                    .offset(offset)
                    .limit(size)
                )

                results = session.exec(statement).all()


            return {
                "query": q,
                "page": page,
                "size": size,
                "offset": offset,
                "results": [
                    {
                        "title": movie.title,
                        "tmdb_id": movie.tmdb_id,
                        "overview": movie.overview,
                        "genre": movie.genres,
                        "tagline": movie.tagline,
                        "release_year": movie.release_year,
                        "vote_average": movie.vote_average,
                        "vote_count": movie.vote_count,
                        "runtime": movie.runtime,
                        "popularity": movie.popularity,
                        "poster_path": movie.poster_path,
                        "backdrop_path": movie.backdrop_path,
                        "similarity_score": round(min(1 - dist, 1.0), 4)
                    }
                    for movie, dist in results
                ]
            }

        except Exception as e:
            logger.error(f"Failed to search movies: {e}")
            raise HTTPException(status_code=500, detail="Search service unavailable")
