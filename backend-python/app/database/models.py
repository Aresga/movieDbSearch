from typing import Optional, List
from sqlmodel import SQLModel, Field
from datetime import datetime
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, Integer, BigInteger

class Movie(SQLModel, table=True):
    __tablename__ = "movies"

    id:            Optional[int]   = Field(default=None, primary_key=True)
    tmdb_id:       int
    title:         str
    overview:      Optional[str]   = None
    tagline:       Optional[str]   = None
    poster_path:   Optional[str]   = None
    backdrop_path: Optional[str]   = None
    release_year:  Optional[int]   = None
    genres:        Optional[str]   = None
    vote_average:  float           = 0.0
    vote_count:    int             = 0
    runtime:       Optional[int]   = None   
    popularity:    Optional[float] = None   
    embedding:     List[float]     = Field(sa_column=Column(Vector(384)))


from datetime import datetime

class UserMovieAction(SQLModel, table=True):
    __tablename__ = "user_movie_actions"

    id:         Optional[int] = Field(default=None, primary_key=True)
    user_id:    str           = Field(sa_column=Column("userId", String))
    movie_id:   int           = Field(sa_column=Column("movieId", Integer))
    action:     str
    created_at: datetime      = Field(sa_column=Column("createdAt", default=datetime.utcnow))