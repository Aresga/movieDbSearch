import asyncio
import os
import time
import httpx
from sqlalchemy import create_engine, text
from sentence_transformers import SentenceTransformer

# 1. Setup & Config
API_KEY = os.getenv("TMDB_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Initialize local 384-dim model
model = SentenceTransformer('all-MiniLM-L6-v2') 

DISCOVER_URL = "https://api.themoviedb.org/3/discover/movie"
DETAILS_URL = "https://api.themoviedb.org/3/movie"

async def expand_database(target_new_movies=5000):
    added_count = 0
    page = 1
    
    print(f"🚀 Scraping {target_new_movies} movies (2018-2026) with full metadata...")
    
    async with httpx.AsyncClient() as client:
        while added_count < target_new_movies:
            # Step 1: Discover popular movie IDs
            discover_res = await client.get(DISCOVER_URL, params={
                "api_key": API_KEY,
                "sort_by": "popularity.desc",
                "primary_release_date.gte": "2018-01-01",
                "vote_count.gte": 150,
                "page": page
            })
            
            if discover_res.status_code != 200:
                print(f"❌ API Error on page {page}")
                break
                
            results = discover_res.json().get("results", [])
            if not results: break

            for m in results:
                if added_count >= target_new_movies: break
                tmdb_id = m['id']
                
                # Check for duplicates
                with engine.connect() as conn:
                    if conn.execute(text("SELECT 1 FROM movies WHERE tmdb_id = :id"), {"id": tmdb_id}).fetchone():
                        continue

                # Step 2: Fetch FULL details (for tagline, runtime, and full genre names)
                detail_res = await client.get(f"{DETAILS_URL}/{tmdb_id}", params={"api_key": API_KEY})
                if detail_res.status_code != 200:
                    continue
                
                data = detail_res.json()

                # Generate Embedding locally (Title + Overview)
                text_to_embed = f"{data.get('title', '')}: {data.get('overview', '')}"
                embedding = model.encode(text_to_embed).tolist()

                # Map all columns
                movie_data = {
                    "tmdb_id": tmdb_id,
                    "title": data.get("title"),
                    "overview": data.get("overview"),
                    "genres": [g["name"] for g in data.get("genres", [])],
                    "tagline": data.get("tagline"),
                    "year": int(data.get("release_date", "0000")[:4]) if data.get("release_date") else None,
                    "va": data.get("vote_average"),
                    "vc": data.get("vote_count"),
                    "rt": data.get("runtime"),
                    "pop": data.get("popularity"),
                    "pp": data.get("poster_path"),
                    "bp": data.get("backdrop_path"),
                    "emb": embedding
                }

                # Step 3: Insert into DB
                with engine.connect() as conn:
                    conn.execute(
                        text("""
                            INSERT INTO movies (
                                tmdb_id, title, overview, genres, tagline, 
                                release_year, vote_average, vote_count, 
                                runtime, popularity, poster_path, backdrop_path, embedding
                            ) VALUES (
                                :tmdb_id, :title, :overview, :genres, :tagline,
                                :year, :va, :vc, :rt, :pop, :pp, :bp, :emb
                            )
                        """),
                        movie_data
                    )
                    conn.commit()

                added_count += 1
                if added_count % 50 == 0:
                    print(f"✅ Total: {added_count}/{target_new_movies} | Added: {data.get('title')}")

            page += 1
            await asyncio.sleep(0.1) # Stay within TMDB rate limits

    print(f"🏁 Done! Added {added_count} movies.")

if __name__ == "__main__":
    asyncio.run(expand_database())