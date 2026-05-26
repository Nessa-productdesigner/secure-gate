-- Apply to databases created before indexes/cascade updates (safe if already applied).

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT IF EXISTS "Token_userId_fkey";

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Token_userId_type_idx" ON "Token"("userId", "type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Token_expiresAt_idx" ON "Token"("expiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
