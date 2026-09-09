-- CreateEnum
CREATE TYPE "news_sentiment_enum" AS ENUM ('positive', 'neutral', 'negative');

-- CreateEnum
CREATE TYPE "event_impact_enum" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "news_articles" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "sentiment" "news_sentiment_enum" DEFAULT 'neutral',
    "source" VARCHAR(100),
    "url" VARCHAR(500),
    "asset_class" "asset_class_enum",
    "is_breaking" BOOLEAN NOT NULL DEFAULT false,
    "read_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_instruments" (
    "news_id" UUID NOT NULL,
    "instrument_id" UUID NOT NULL,

    CONSTRAINT "news_instruments_pkey" PRIMARY KEY ("news_id","instrument_id")
);

-- CreateTable
CREATE TABLE "economic_events" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "country" VARCHAR(3) NOT NULL,
    "event_date" TIMESTAMPTZ(6) NOT NULL,
    "impact" "event_impact_enum" NOT NULL DEFAULT 'medium',
    "actual" VARCHAR(50),
    "forecast" VARCHAR(50),
    "previous" VARCHAR(50),
    "unit" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "economic_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_news_articles_published_at" ON "news_articles"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_news_articles_is_breaking" ON "news_articles"("is_breaking");

-- CreateIndex
CREATE INDEX "idx_news_articles_read_count" ON "news_articles"("read_count" DESC);

-- CreateIndex
CREATE INDEX "idx_news_articles_asset_class" ON "news_articles"("asset_class");

-- CreateIndex
CREATE INDEX "idx_news_instruments_instrument_id" ON "news_instruments"("instrument_id");

-- CreateIndex
CREATE INDEX "idx_economic_events_event_date" ON "economic_events"("event_date" ASC);

-- CreateIndex
CREATE INDEX "idx_economic_events_country" ON "economic_events"("country");

-- CreateIndex
CREATE INDEX "idx_economic_events_impact" ON "economic_events"("impact");

-- AddForeignKey
ALTER TABLE "news_instruments" ADD CONSTRAINT "news_instruments_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_instruments" ADD CONSTRAINT "news_instruments_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
