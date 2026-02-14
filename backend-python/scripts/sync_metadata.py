import asyncio
import time
import httpx
from sqlalchemy import create_engine, text
from app.config import settings
import os

# Configuration
API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3/movie"
DATABASE_URL = os.getenv("DATABASE_URL")

# Rate limiting: 10 requests per second
DELAY = 0.1

async def update_all_movies():
    engine = create_engine(DATABASE_URL)
    
    # 1. Fetch all movies that need updating
    with engine.connect() as conn:
        movies = conn.execute(text("SELECT tmdb_id, title FROM movies")).fetchall()
    
    total = len(movies)
    updated_count = 0
    error_count = 0
    
    print(f"🚀 Starting sync for {total} movies...")
    start_time = time.time()

    async with httpx.AsyncClient() as client:
        for index, (tmdb_id, title) in enumerate(movies):
            try:
                # 2. Request data from TMDB
                url = f"{BASE_URL}/{tmdb_id}?api_key={API_KEY}"
                response = await client.get(url, timeout=10.0)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # 3. Prepare values for your specific schema
                    params = {
                        "id": tmdb_id,
                        "tagline": data.get('tagline'),
                        "vote_avg": data.get('vote_average'),
                        "vote_cnt": data.get('vote_count'),
                        "runtime": data.get('runtime'),
                        "popularity": data.get('popularity'),
                        "poster": data.get('poster_path'),
                        "backdrop": data.get('backdrop_path')
                    }

                    # 4. Execute Update
                    with engine.connect() as conn:
                        conn.execute(
                            text("""
                                UPDATE movies 
                                SET tagline = :tagline,
                                    vote_average = :vote_avg,
                                    vote_count = :vote_cnt,
                                    runtime = :runtime,
                                    popularity = :popularity,
                                    poster_path = :poster,
                                    backdrop_path = :backdrop
                                WHERE tmdb_id = :id
                            """),
                            params
                        )
                        conn.commit()
                    updated_count += 1
                else:
                    print(f"⚠️  Skipped {title} (ID: {tmdb_id}) - Status: {response.status_code}")
                    error_count += 1

                # 5. Respect the rate limit
                await asyncio.sleep(DELAY)

                # Progress logging
                if (index + 1) % 100 == 0:
                    elapsed = time.time() - start_time
                    print(f"📊 Progress: {index + 1}/{total} | Updated: {updated_count} | Errors: {error_count} | Elapsed: {int(elapsed)}s")

            except Exception as e:
                print(f"❌ Error on movie {title} (ID: {tmdb_id}): {str(e)}")
                error_count += 1
                continue

    end_time = time.time()
    duration = (end_time - start_time) / 60
    print(f"\n✅ Sync Complete!")
    print(f"Total processed: {total}")
    print(f"Successfully updated: {updated_count}")
    print(f"Errors/Skipped: {error_count}")
    print(f"Total time: {duration:.2f} minutes")

if __name__ == "__main__":
    asyncio.run(update_all_movies())