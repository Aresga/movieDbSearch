-- CreateEnum
CREATE TYPE "MovieAction" AS ENUM ('watched', 'wishlisted');

-- CreateTable
CREATE TABLE "user_movie_actions" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "action" "MovieAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_movie_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_movie_actions_userId_idx" ON "user_movie_actions"("userId");

-- CreateIndex
CREATE INDEX "user_movie_actions_movieId_idx" ON "user_movie_actions"("movieId");

-- CreateIndex
CREATE INDEX "user_movie_actions_userId_action_idx" ON "user_movie_actions"("userId", "action");

-- AddForeignKey
ALTER TABLE "user_movie_actions" ADD CONSTRAINT "user_movie_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
