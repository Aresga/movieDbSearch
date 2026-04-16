import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from prometheus_fastapi_instrumentator import Instrumentator
from sentence_transformers import SentenceTransformer

from .config.settings import settings
from .database.connection import DatabaseConnection
from .api.dependencies import container
from .api.endpoints import router
from .services.sentiment_service import SentimentService

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- API Lifecycle Management ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    db_connection = None
    logger.info("Starting up ... Loading AI Model and Database Resources...")
    
    try:
        # 1. Startup: Initialize services and load resources
        db_connection = DatabaseConnection()
        sentiment_service = SentimentService()
        engine = db_connection.create_engine()
        model = SentenceTransformer(
            settings.model_name, 
            cache_folder=settings.transformers_cache, 
            local_files_only=True)

        # Inject dependencies into the shared container
        container.engine = engine
        container.model = model
        container.sentiment_service = sentiment_service

        # Keep the lifespan context open until application shutdown.
        yield

    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise
    finally:
        # 2. Shutdown: Safe resource cleanup
        if db_connection:
            db_connection.dispose()
            logger.info("Resources released. Shutting down...")

# --- FastAPI App Initialization ---
app = FastAPI(lifespan=lifespan)

# Include application routes
app.include_router(router)

Instrumentator().instrument(app).expose(app, include_in_schema=False)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)