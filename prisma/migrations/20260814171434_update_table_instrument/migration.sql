/*
  Warnings:

  - You are about to drop the column `assetClass` on the `Instrument` table. All the data in the column will be lost.
  - Added the required column `asset_class` to the `Instrument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "asset_class_enum" AS ENUM ('equity', 'bond', 'crypto', 'fx', 'commodity');

-- AlterTable
ALTER TABLE "Instrument" DROP COLUMN "assetClass",
ADD COLUMN     "asset_class" "asset_class_enum" NOT NULL;

-- CreateIndex
CREATE INDEX "idx_instruments_ticker" ON "Instrument"("ticker");

-- CreateIndex
CREATE INDEX "idx_instruments_asset_class" ON "Instrument"("asset_class");

-- CreateIndex
CREATE INDEX "idx_instruments_country" ON "Instrument"("country");
