-- CreateTable
CREATE TABLE "market_indices" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "country_code" VARCHAR(3),
    "region" VARCHAR(50),
    "currency" VARCHAR(3),
    "category" VARCHAR(50),
    "current_value" DECIMAL(20,6),
    "daily_change" DECIMAL(10,4),
    "daily_change_abs" DECIMAL(20,6),
    "unit" VARCHAR(30),
    "last_updated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_indices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sovereign_yields" (
    "id" UUID NOT NULL,
    "country_code" VARCHAR(3),
    "instrument_name" VARCHAR(100) NOT NULL,
    "maturity" VARCHAR(20),
    "yield_rate" DECIMAL(10,4),
    "change_bps" DECIMAL(10,2),
    "period" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sovereign_yields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_conditions" (
    "id" UUID NOT NULL,
    "indicator_code" VARCHAR(50) NOT NULL,
    "indicator_name" VARCHAR(100) NOT NULL,
    "value" DECIMAL(10,4),
    "status" VARCHAR(50),
    "period" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_hours" (
    "id" UUID NOT NULL,
    "market" VARCHAR(100) NOT NULL,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "open" VARCHAR(5) NOT NULL,
    "close" VARCHAR(5) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "market_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_indices_code_key" ON "market_indices"("code");

-- CreateIndex
CREATE INDEX "idx_market_indices_code" ON "market_indices"("code");

-- CreateIndex
CREATE INDEX "idx_market_indices_category" ON "market_indices"("category");

-- CreateIndex
CREATE INDEX "idx_market_indices_country" ON "market_indices"("country_code");

-- CreateIndex
CREATE INDEX "idx_yields_country" ON "sovereign_yields"("country_code", "period" DESC);

-- CreateIndex
CREATE INDEX "idx_sovereign_yields_instrument" ON "sovereign_yields"("instrument_name");

-- CreateIndex
CREATE INDEX "idx_market_conditions_indicator_period" ON "market_conditions"("indicator_code", "period" DESC);

-- CreateIndex
CREATE INDEX "idx_market_conditions_period" ON "market_conditions"("period" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "market_hours_market_key" ON "market_hours"("market");

-- AddForeignKey
ALTER TABLE "market_indices" ADD CONSTRAINT "market_indices_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sovereign_yields" ADD CONSTRAINT "sovereign_yields_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;
