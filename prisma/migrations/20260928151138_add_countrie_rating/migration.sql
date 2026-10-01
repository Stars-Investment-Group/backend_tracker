-- CreateTable
CREATE TABLE "country_ratings" (
    "id" UUID NOT NULL,
    "country_code" VARCHAR(3) NOT NULL,
    "overall_score" DECIMAL(5,2) NOT NULL,
    "rating" VARCHAR(10),
    "pillar_scores" JSONB NOT NULL,
    "positive_drivers" JSONB,
    "negative_drivers" JSONB,
    "upgrade_triggers" JSONB,
    "downgrade_triggers" JSONB,
    "review_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "country_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_ratings_country" ON "country_ratings"("country_code", "review_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "country_ratings_country_code_review_date_key" ON "country_ratings"("country_code", "review_date");

-- AddForeignKey
ALTER TABLE "country_ratings" ADD CONSTRAINT "country_ratings_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
