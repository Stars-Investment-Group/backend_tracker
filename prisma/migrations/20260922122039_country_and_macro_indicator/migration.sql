/*
  Warnings:

  - You are about to drop the column `is_latest` on the `economic_indicators` table. All the data in the column will be lost.
  - You are about to drop the column `last_seen_at` on the `economic_indicators` table. All the data in the column will be lost.
  - You are about to drop the column `vintage_date` on the `economic_indicators` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,dataset,series_code,period]` on the table `economic_indicators` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "economic_indicators_provider_dataset_series_code_period_vin_key";

-- DropIndex
DROP INDEX "idx_indicator_country_dataset";

-- DropIndex
DROP INDEX "idx_indicator_latest";

-- AlterTable
ALTER TABLE "economic_indicators" DROP COLUMN "is_latest",
DROP COLUMN "last_seen_at",
DROP COLUMN "vintage_date";

-- CreateTable
CREATE TABLE "countries" (
    "code" VARCHAR(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "region" VARCHAR(50),
    "subregion" VARCHAR(50),
    "income_level" VARCHAR(20),
    "currency" VARCHAR(3),
    "latitude" DECIMAL(10,6),
    "longitude" DECIMAL(10,6),
    "flag_url" VARCHAR(255),
    "is_aggregate" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "macro_indicators" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50),
    "unit" VARCHAR(20),
    "frequency" VARCHAR(20),
    "source" VARCHAR(100),
    "is_seasonally_adjusted" BOOLEAN NOT NULL DEFAULT false,
    "coverage_start" DATE,
    "coverage_end" DATE,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "macro_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_countries_region" ON "countries"("region");

-- CreateIndex
CREATE INDEX "idx_countries_income" ON "countries"("income_level");

-- CreateIndex
CREATE UNIQUE INDEX "macro_indicators_code_key" ON "macro_indicators"("code");

-- CreateIndex
CREATE INDEX "idx_indicators_category" ON "macro_indicators"("category");

-- CreateIndex
CREATE UNIQUE INDEX "economic_indicators_provider_dataset_series_code_period_key" ON "economic_indicators"("provider", "dataset", "series_code", "period");
