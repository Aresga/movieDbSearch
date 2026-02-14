from typing import Optional, List
from sqlmodel import SQLModel, Field
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column

class Movie(SQLModel, table=True):
    __tablename__ = "movies"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Metadata Fields
    tmdb_id: int
    title: str
    overview: Optional[str] = None
    tagline: Optional[str] = None
    poster_path: Optional[str] = None
    release_year: Optional[int] = None
    genres: Optional[str] = None
    vote_average: float = 0.0
    vote_count: int = 0
    backdrop_path: Optional[str] = None
    embedding: List[float] = Field(sa_column=Column(Vector(384)))