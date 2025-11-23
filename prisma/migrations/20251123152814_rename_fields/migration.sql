/*
  Warnings:

  - The primary key for the `Link` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clickCount` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `lastClicked` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Link` table. All the data in the column will be lost.
  - Added the required column `longUrl` to the `Link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortCode` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Link_code_idx";

-- DropIndex
DROP INDEX "Link_lastClicked_idx";

-- AlterTable
ALTER TABLE "Link" DROP CONSTRAINT "Link_pkey",
DROP COLUMN "clickCount",
DROP COLUMN "code",
DROP COLUMN "lastClicked",
DROP COLUMN "url",
ADD COLUMN     "lastClickedAt" TIMESTAMPTZ(3),
ADD COLUMN     "longUrl" TEXT NOT NULL,
ADD COLUMN     "shortCode" VARCHAR(8) NOT NULL,
ADD COLUMN     "totalClicks" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "Link_pkey" PRIMARY KEY ("shortCode");

-- CreateIndex
CREATE INDEX "Link_shortCode_idx" ON "Link"("shortCode");

-- CreateIndex
CREATE INDEX "Link_lastClickedAt_idx" ON "Link"("lastClickedAt");
