from typing import Optional
from sqlalchemy.engine import Engine
from sentence_transformers import SentenceTransformer
from app.services.ingestion_service import DataIngestionService
from app.services.search_service import SearchService

class AppContainer:
    def __init__(self):
        self._engine: Optional[Engine] = None
        self._model: Optional[SentenceTransformer] = None

    @property
    def engine(self):
        return self._engine

    @engine.setter
    def engine(self, value):
        self._engine = value

    @property
    def model(self):
        return self._model

    @model.setter
    def model(self, value):
        self._model = value

    @property
    def ingestion_service(self):
        return DataIngestionService(self._engine, self._model)

    @property
    def search_service(self):
        return SearchService(self._engine, self._model)

# Global container
container = AppContainer()

def get_search_service() -> SearchService:
    return container.search_service