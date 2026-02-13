import os
from typing import Optional

class Settings:
    """Application settings and configuration."""

    def __init__(self):
        # Database Configuration
        self.db_user: str = os.getenv("DATABASE_USER")
        self.db_pass: str = os.getenv("DATABASE_PASSWORD")
        self.db_host: str = "postgres"
        self.db_name: str = os.getenv("DATABASE_DB")
        self.database_url: str = os.getenv("DATABASE_URL")  
        ##self.database_url: str = f"postgresql://{self.db_user}:{self.db_pass}@{self.db_host}:5432/{self.db_name}"

        # Model Configuration
        self.model_name: Optional[str] = os.getenv("MODEL_NAME")

        # Dataset url 
        # self.csv_path: str = 'dbCSV/imdb_top_1000.csv'
        self.csv_path: str = 'dbCSV/movies_metadata.csv'
        self.tmdb_key: str = os.getenv("TMDB_API_KEY")

# Global instance
settings = Settings()