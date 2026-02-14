from fastapi import APIRouter, Depends, Query
from app.services.search_service import SearchService
from .dependencies import get_search_service

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "running", "message": "Movie Search API is ready"}

@router.get("/search")
async def search_movies(
    q: str = Query(..., min_l=1),
    limit: int = Query(5, ge=1, le=100),
    service: SearchService = Depends(get_search_service)
):
    """
    Search for movies endpoint.
    """
    return service.search_movies(q, limit)
