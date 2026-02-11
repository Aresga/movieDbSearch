import os
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, text
from sentence_transformers import SentenceTransformer

# --- Configuration ---
DB_USER = os.getenv("DATABASE_USER", "moviesearch_user")
DB_PASS = os.getenv("DATABASE_PASSWORD", "changeme123")
DB_HOST = "postgres"
DB_NAME = os.getenv("DATABASE_DB", "moviesearch_db")
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}"

# Global variables for resources we load once
resources = {}

def init_db(engine):
    """Creates table and enables vector extension."""
    with engine.connect() as conn:
        conn.commit()
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS movies (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                plot TEXT NOT NULL,
                url TEXT,
                embedding vector(384)
            )
        """))
        conn.commit()

def ingest_data(engine, model):
    """Ingests data only if DB is empty."""
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM movies")).scalar()
        if count > 0:
            print(f"Skipping ingestion: {count} movies already in DB.")
            return

    print("Ingesting data from CSV...")
    csv_path = 'app/dbCSV/imdb_top_1000.csv'
    if not os.path.exists(csv_path):
        print("Warning: CSV not found. Skipping ingestion.")
        return

    df = pd.read_csv(csv_path)
    df = df[['Movie Name', 'Plot', 'Link']].dropna()
    
    # Generate embeddings
    embeddings = model.encode(df['Plot'].tolist())
    
    # Bulk insert
    data = []
    for name, plot, link, emb in zip(df['Movie Name'], df['Plot'], df['Link'], embeddings):
        data.append({
            "title": name, "plot": plot, "url": link, "embedding": emb.tolist()
        })

    with engine.connect() as conn:
        conn.execute(
            text("INSERT INTO movies (title, plot, url, embedding) VALUES (:title, :plot, :url, :embedding)"),
            data
        )
        conn.commit()
    print("Ingestion complete.")

# --- API Lifecycle ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Load model and DB connection
    print("Starting up... Loading AI Model...")
    resources['model'] = SentenceTransformer('all-MiniLM-L6-v2')
    resources['engine'] = create_engine(DATABASE_URL)
    
    # Init and Ingest -> create the db with emb vects 
    init_db(resources['engine'])
    ingest_data(resources['engine'], resources['model'])
    
    yield # App Runs
    
    # 2. Shutdown: Cleanup
    resources['engine'].dispose()
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "running", "message": "Movie Search API is ready"}

@app.get("/search")
def search_movies(q: str, limit: int = 5):
    """
    Search for similar movies 
    """
    if not q:
        raise HTTPException(status_code=400, detail="Query string 'q'")

    # Encode query
    query_vec = resources['model'].encode(q).tolist()

    with resources['engine'].connect() as conn:
        # Fetch top matches using Cosine Distance (<=>)
        results = conn.execute(
            text("""
                SELECT title, plot, url, (embedding <=> :emb) as distance
                FROM movies
                ORDER BY distance ASC
                LIMIT :limit
            """),
            {"emb": str(query_vec), "limit": limit}
        ).fetchall()

    return {
        "query": q,
        "results": [
            {
                "title": row[0],
                "plot": row[1],
                "url": row[2],
                "match_score": round(1 - row[3], 4)
            } 
            for row in results
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)