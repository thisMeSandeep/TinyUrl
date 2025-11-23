-- CreateTable
CREATE TABLE "Link" (
    "code" VARCHAR(12) NOT NULL,
    "url" TEXT NOT NULL,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "lastClicked" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "Link_code_idx" ON "Link"("code");

-- CreateIndex
CREATE INDEX "Link_createdAt_idx" ON "Link"("createdAt");

-- CreateIndex
CREATE INDEX "Link_lastClicked_idx" ON "Link"("lastClicked");
