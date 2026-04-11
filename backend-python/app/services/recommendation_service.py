from ctypes import sizeof
import logging
import numpy as np
from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy.engine import Engine
from app.database.models import Movie, UserMovieAction, UserSearchAction
from sqlalchemy import func


logger = logging.getLogger(__name__)


class RecommendationService:
    def __init__(self, engine: Engine):
        self.engine = engine


    def get_recommendations(self, user_id: str, limit: int = 20) -> dict:
        try:
            with Session(self.engine) as session:

                # Step 1: get seen movie ids
                seen_stmt = (
                    select(UserMovieAction.movie_id)
                    .where(UserMovieAction.user_id == user_id)
                    .where(UserMovieAction.action.in_(["watched", "wishlisted"]))
                )
                seen_ids = session.exec(seen_stmt).all()

                has_search_actions = session.exec(
                    select(UserSearchAction)
                    .where(UserSearchAction.user_id == user_id)
                    .limit(1)
                ).first() is not None


                if not seen_ids and not has_search_actions:
                    return self._fallback(session, limit)

                # vectors from watched/wishlisted movies
                movie_vecs = select(Movie.embedding.label("vec")).where(Movie.embedding != None)
                if seen_ids:
                    movie_vecs = movie_vecs.where(Movie.id.in_(seen_ids))
                else:
                    # no seen movies -> empty movie part
                    movie_vecs = movie_vecs.where(False)

                # vectors from search history
                search_vecs = (
                    select(UserSearchAction.embedding.label("vec"))
                    .where(UserSearchAction.user_id == user_id)
                    .where(UserSearchAction.embedding != None)
                )

                # combine both sources
                all_vecs = movie_vecs.union_all(search_vecs).subquery()

                # single blended user profile
                profile_subquery = (
                    select(func.avg(all_vecs.c.vec).label("profile_vec"))
                    .scalar_subquery()
                )

                # distance = Movie.embedding.cosine_distance(profile_subquery)

                # Step 3: find nearest unseen movies against the subquery result
                distance = Movie.embedding.cosine_distance(profile_subquery)

                statement = (
                    select(Movie, distance)
                    .where(Movie.id.not_in(seen_ids))
                    .where(Movie.embedding != None)
                    .order_by(distance)
                    .limit(limit)
                )

                results = session.exec(statement).all()

                if not results:
                    return self._fallback(session, limit)

                return {
                    "user_id": user_id,
                    "results": [self._format(movie, dist) for movie, dist in results]
                }

        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            raise HTTPException(status_code=500, detail="Recommendation service unavailable")




    # def get_recommendations(self, user_id: str, limit: int = 20) -> dict:
    #     try:
    #         with Session(self.engine) as session:

    #             # get movie_ids user already interacted with from the usermovieAction table
    #             seen_stmt = (
    #                 select(UserMovieAction.movie_id)
    #                 .where(UserMovieAction.user_id == user_id)
    #                 .where(UserMovieAction.action.in_(["watched", "wishlisted"]))
    #             )
    #             seen_ids = session.exec(seen_stmt).all()

    #             if not seen_ids:
    #                 return self._fallback(session, limit)

    #             # fetch embeddings of seen movies and average them -> creates a taste vector for user
    #             embeddings_stmt = (
    #                 select(Movie.embedding)
    #                 .where(Movie.id.in_(seen_ids))
    #                 .where(Movie.embedding != None)
    #             )
    #             embeddings = session.exec(embeddings_stmt).all()

    #             logger.info(f"Embeddings size: {len(embeddings)}")

    #             if not embeddings:
    #                 return self._fallback(session, limit)

    #             profile_vec = np.mean(embeddings, axis=0).tolist()

    #             # Find nearest unseen movies by cosine distance
    #             distance = Movie.embedding.cosine_distance(profile_vec)

    #             statement = (
    #                 select(Movie, distance)
    #                 .where(Movie.id.not_in(seen_ids))
    #                 .where(Movie.embedding != None)
    #                 .order_by(distance)
    #                 .limit(limit)
    #             )

    #             results = session.exec(statement).all()

    #             return {
    #                 "user_id": user_id,
    #                 "results": [self._format(movie, dist) for movie, dist in results]
    #             }

    #     except Exception as e:
    #         logger.error(f"Failed to get recommendations: {e}")
    #         raise HTTPException(status_code=500, detail="Recommendation service unavailable")

    def _fallback(self, session: Session, limit: int) -> dict:
        statement = (
            select(Movie)
            .where(Movie.vote_count >= 100)
            .where(Movie.embedding != None)
            .order_by(Movie.vote_average.desc())
            .limit(limit)
        )
        movies = session.exec(statement).all()
        return {
            "user_id": None,
            "results": [self._format(m, None) for m in movies]
        }

    def _format(self, movie: Movie, dist: float | None) -> dict:
        return {
            "title":            movie.title,
            "tmdb_id":          movie.tmdb_id,
            "overview":         movie.overview,
            "tagline":          movie.tagline,
            "poster_path":      movie.poster_path,
            "backdrop_path":    movie.backdrop_path,
            "release_year":     movie.release_year,
            "genre":            movie.genres,
            "vote_average":     movie.vote_average,
            "vote_count":       movie.vote_count,
            "runtime":          movie.runtime,
            "popularity":       movie.popularity,
            "similarity_score": round(min(1 - dist, 1.0), 4) if dist is not None else None
        }