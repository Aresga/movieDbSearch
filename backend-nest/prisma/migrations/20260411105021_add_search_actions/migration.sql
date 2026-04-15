-- CreateTable
CREATE TABLE "user_search_actions" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_search_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_search_actions_userId_idx" ON "user_search_actions"("userId");

-- AddForeignKey
ALTER TABLE "user_search_actions" ADD CONSTRAINT "user_search_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
