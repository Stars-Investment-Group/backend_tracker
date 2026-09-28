-- CreateTable
CREATE TABLE "macro_regimes" (
    "id" UUID NOT NULL,
    "country_code" VARCHAR(3) NOT NULL,
    "regime" VARCHAR(50) NOT NULL,
    "momentum" VARCHAR(20),
    "confidence" DECIMAL(5,2),
    "risk_score" DECIMAL(5,2),
    "growth_score" DECIMAL(5,2),
    "inflation_score" DECIMAL(5,2),
    "policy_stance" VARCHAR(50),
    "period" DATE NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "macro_regimes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_regimes_country" ON "macro_regimes"("country_code", "valid_from" DESC);

-- CreateIndex
CREATE INDEX "idx_regimes_regime" ON "macro_regimes"("regime");

-- AddForeignKey
ALTER TABLE "macro_regimes" ADD CONSTRAINT "macro_regimes_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
