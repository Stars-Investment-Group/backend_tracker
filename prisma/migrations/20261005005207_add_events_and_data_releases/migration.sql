-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "country_code" VARCHAR(3),
    "region_code" VARCHAR(20),
    "event_date" DATE NOT NULL,
    "event_time" TIME,
    "impact" VARCHAR(20),
    "importance" INTEGER,
    "source" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_releases" (
    "id" UUID NOT NULL,
    "indicator_id" UUID NOT NULL,
    "country_code" VARCHAR(3) NOT NULL,
    "release_date" DATE NOT NULL,
    "period" DATE NOT NULL,
    "status" VARCHAR(20),
    "actual_value" DECIMAL(20,6),
    "previous_value" DECIMAL(20,6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_releases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_events_date" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "idx_events_region" ON "events"("region_code");

-- CreateIndex
CREATE INDEX "idx_events_impact" ON "events"("impact");

-- CreateIndex
CREATE INDEX "idx_data_releases_date" ON "data_releases"("release_date");

-- CreateIndex
CREATE INDEX "idx_data_releases_indicator" ON "data_releases"("indicator_id");

-- CreateIndex
CREATE INDEX "idx_data_releases_country" ON "data_releases"("country_code");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_releases" ADD CONSTRAINT "data_releases_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "macro_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_releases" ADD CONSTRAINT "data_releases_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
