-- CreateTable
CREATE TABLE "macro_data" (
    "id" UUID NOT NULL,
    "country_code" VARCHAR(3) NOT NULL,
    "indicator_id" UUID NOT NULL,
    "vintage_date" DATE NOT NULL,
    "period" DATE NOT NULL,
    "value" DECIMAL(20,6) NOT NULL,
    "is_forecast" BOOLEAN NOT NULL DEFAULT false,
    "is_estimate" BOOLEAN NOT NULL DEFAULT false,
    "release_date" DATE,
    "next_release_date" DATE,
    "source" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "macro_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_macro_data_country_indicator" ON "macro_data"("country_code", "indicator_id");

-- CreateIndex
CREATE INDEX "idx_macro_data_period" ON "macro_data"("period" DESC);

-- CreateIndex
CREATE INDEX "idx_macro_data_vintage" ON "macro_data"("vintage_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "macro_data_country_code_indicator_id_period_vintage_date_key" ON "macro_data"("country_code", "indicator_id", "period", "vintage_date");

-- AddForeignKey
ALTER TABLE "macro_data" ADD CONSTRAINT "macro_data_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "macro_data" ADD CONSTRAINT "macro_data_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "macro_indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
