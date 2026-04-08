from fastapi import APIRouter, Depends, Query
from app.services.search_service import SearchService
from pydantic import BaseModel
from app.services.sentiment_service import SentimentService
from .dependencies import get_search_service, get_sentiment_service

class reviewRequest(BaseModel):
    text: str

class BatchReviewRequest(BaseModel):
    texts: list[str]

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "running", "message": "Movie Search API is ready"}

@router.get("/search")
async def search_movies(
    q: str = Query(..., min_l=1),
    page: int = Query(1, ge=1),
    size: int = Query(5, ge=1, le=100),
    service: SearchService = Depends(get_search_service)
):
    """
    Search for movies endpoint.
    """
    return service.search_movies(q, page, size)

@router.post("/sentiment")
def analyze_sentiment(
    body: reviewRequest,
    svc: SentimentService = Depends(get_sentiment_service)
): 
    """
    Get sentiment analyzis
    """
    return svc.analyze(body.text)
