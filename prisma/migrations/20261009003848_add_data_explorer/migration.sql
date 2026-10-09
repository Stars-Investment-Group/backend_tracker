-- CreateTable
CREATE TABLE "data_quality" (
    "id" UUID NOT NULL,
    "indicator_id" UUID NOT NULL,
    "country_code" VARCHAR(3) NOT NULL,
    "source_reliability" VARCHAR(20) NOT NULL,
    "timeliness" VARCHAR(20) NOT NULL,
    "coverage" VARCHAR(20) NOT NULL,
    "revision_volatility" VARCHAR(20) NOT NULL,
    "breaks_structural_changes" VARCHAR(20) NOT NULL,
    "overall_score" DECIMAL(5,2) NOT NULL,
    "period" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_quality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicator_correlations" (
    "id" UUID NOT NULL,
    "indicator_id" UUID NOT NULL,
    "related_indicator_id" UUID NOT NULL,
    "correlation" DECIMAL(5,4) NOT NULL,
    "period_years" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indicator_correlations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_data_quality_indicator" ON "data_quality"("indicator_id");

-- CreateIndex
CREATE INDEX "idx_data_quality_country" ON "data_quality"("country_code");

-- CreateIndex
CREATE INDEX "idx_data_quality_indicator_country" ON "data_quality"("indicator_id", "country_code");

-- CreateIndex
CREATE INDEX "indicator_correlations_indicator_id_idx" ON "indicator_correlations"("indicator_id");

-- CreateIndex
CREATE INDEX "indicator_correlations_related_indicator_id_idx" ON "indicator_correlations"("related_indicator_id");

-- CreateIndex
CREATE UNIQUE INDEX "indicator_correlations_indicator_id_related_indicator_id_pe_key" ON "indicator_correlations"("indicator_id", "related_indicator_id", "period_years");

-- AddForeignKey
ALTER TABLE "data_quality" ADD CONSTRAINT "data_quality_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "macro_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_quality" ADD CONSTRAINT "data_quality_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_correlations" ADD CONSTRAINT "indicator_correlations_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "macro_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_correlations" ADD CONSTRAINT "indicator_correlations_related_indicator_id_fkey" FOREIGN KEY ("related_indicator_id") REFERENCES "macro_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
