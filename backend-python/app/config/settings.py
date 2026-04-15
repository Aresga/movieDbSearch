import os
import hvac
import time
from typing import Optional

class Settings:
    def __init__(self):
        # Load and update environment variables from Vault
        vault_secrets = self._get_from_vault()
        os.environ.update(vault_secrets)

        # Database Configuration
        self.db_user: str = os.getenv("POSTGRES_USER")
        self.db_pass: str = os.getenv("POSTGRES_PASSWORD")
        self.db_host: str = "postgres"
        self.db_name: str = os.getenv("POSTGRES_DB")
        self.database_url: str = f"postgresql://{self.db_user}:{self.db_pass}@{self.db_host}:5432/{self.db_name}"

        # Model Configuration
        self.model_name: Optional[str] = os.getenv("MODEL_NAME")
        self.hf_home: str = os.getenv("HF_HOME")
        self.transformers_cache: str = os.getenv("TRANSFORMERS_CACHE")
        self.hf_hub_offline: bool = os.getenv("HF_HUB_OFFLINE") == "1"
        self.transformers_offline: bool = os.getenv("TRANSFORMERS_OFFLINE") == "1"


        # Dataset Configuration
        self.csv_path: str = 'dbCSV/movies_metadata.csv'
        self.tmdb_key: str = os.getenv("TMDB_API_KEY")

    def _get_from_vault(self) -> dict:
        v_url = os.getenv("VAULT_ADDR", "http://vault:8200")
        token_path = os.getenv("VAULT_TOKEN_FILE")
        
        if not token_path:
            return {}

        # Read actual token from secret file
        try:
            with open(token_path, 'r') as f:
                v_token = f.read().strip()
        except Exception:
            return {}

        client = hvac.Client(url=v_url, token=v_token)

        # Retry loop until secrets are injected
        while True:
            try:
                # Path matches setup-secrets.sh
                response = client.secrets.kv.v2.read_secret_version(
                    mount_point='secret', 
                    path='movies'
                )
                return response['data']['data']
            except Exception:
                print("Waiting for secrets injection...")
                time.sleep(5)

# Global instance
settings = Settings()