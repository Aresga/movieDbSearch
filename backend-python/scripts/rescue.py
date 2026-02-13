import asyncio
import time
import httpx
from sqlalchemy import create_engine, text
import os

# Configuration (Matching your provided structure)
API_KEY = os.getenv("TMDB_API_KEY")
SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
MOVIE_URL = "https://api.themoviedb.org/3/movie"
DATABASE_URL = os.getenv("DATABASE_URL")

# Rate limiting
DELAY = 0.1

async def repair_and_update():
    engine = create_engine(DATABASE_URL)
    
    # 1. Fetch only the broken records
    with engine.connect() as conn:
        movies = conn.execute(
            text("SELECT id, title, release_year FROM movies WHERE runtime IS NULL")
        ).fetchall()
    
    total = len(movies)
    updated_count = 0
    error_count = 0
    
    print(f"🚀 Starting repair sync for {total} broken entries...")
    start_time = time.time()

    async with httpx.AsyncClient() as client:
        for index, (local_id, title, year) in enumerate(movies):
            try:
                # 2. Search by title and year to get the NEW tmdb_id
                search_response = await client.get(
                    SEARCH_URL, 
                    params={"api_key": API_KEY, "query": title, "primary_release_year": year},
                    timeout=10.0
                )
                
                search_data = search_response.json().get("results")
                
                if search_data:
                    new_tmdb_id = search_data[0]["id"]
                    
                    # 3. Now get the full details (runtime, tagline, etc.) using the NEW ID
                    details_url = f"{MOVIE_URL}/{new_tmdb_id}?api_key={API_KEY}"
                    details_response = await client.get(details_url, timeout=10.0)
                    
                    if details_response.status_code == 200:
                        data = details_response.json()
                        
                        # 4. Prepare params (Updating tmdb_id to the fresh one)
                        params = {
                            "local_id": local_id,
                            "new_tmdb_id": new_tmdb_id,
                            "tagline": data.get('tagline'),
                            "vote_avg": data.get('vote_average'),
                            "vote_cnt": data.get('vote_count'),
                            "runtime": data.get('runtime'),
                            "popularity": data.get('popularity'),
                            "poster": data.get('poster_path'),
                            "backdrop": data.get('backdrop_path')
                        }

                        # 5. Execute Update (Targeting our internal serial ID)
                        with engine.connect() as conn:
                            conn.execute(
                                text("""
                                    UPDATE movies 
                                    SET tmdb_id = :new_tmdb_id,
                                        tagline = :tagline,
                                        vote_average = :vote_avg,
                                        vote_count = :vote_cnt,
                                        runtime = :runtime,
                                        popularity = :popularity,
                                        poster_path = :poster,
                                        backdrop_path = :backdrop
                                    WHERE id = :local_id
                                """),
                                params
                            )
                            conn.commit()
                        updated_count += 1
                else:
                    print(f"⚠️  No match found for {title} ({year})")
                    error_count += 1

                # 6. Rate limit
                await asyncio.sleep(DELAY)

                if (index + 1) % 50 == 0:
                    print(f"📊 Progress: {index + 1}/{total} | Rescued: {updated_count}")

            except Exception as e:
                print(f"❌ Error on {title}: {str(e)}")
                error_count += 1

    duration = (time.time() - start_time) / 60
    print(f"\n✅ Repair Job Complete! Rescued {updated_count} movies in {duration:.2f} mins.")

if __name__ == "__main__":
    asyncio.run(repair_and_update())