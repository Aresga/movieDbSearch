-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "tmdb_id" INTEGER,
    "title" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "genres" TEXT[],
    "tagline" TEXT,
    "release_year" INTEGER,
    "vote_average" DOUBLE PRECISION,
    "vote_count" INTEGER,
    "runtime" INTEGER,
    "popularity" DOUBLE PRECISION,
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "embedding" vector(384),

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdb_id_key" ON "movies"("tmdb_id");

