import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
from .config.settings import settings
from .database.connection import DatabaseConnection
from .api.dependencies import container
from .api.endpoints import router
from .services.sentiment_service import SentimentService

# --- Logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- API Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Load model and DB connection
    logger.info("Starting up ... Loading AI Model...")
    try:
        db_connection = DatabaseConnection()
        sentiment_service = SentimentService()
        engine = db_connection.create_engine()
        model = SentenceTransformer(settings.model_name)

        container.engine = engine
        container.model = model
        container.sentiment_service = sentiment_service

        # # Init and Ingest -> create the db with emb vects
        # container.ingestion_service.init_db()
        # container.ingestion_service.ingest_data()

    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise

    yield  # app runs and stops here.

    # 2. Shutdown: Cleanup
    db_connection.dispose()
    logger.info("Shutting down...")

app = FastAPI(lifespan=lifespan)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)