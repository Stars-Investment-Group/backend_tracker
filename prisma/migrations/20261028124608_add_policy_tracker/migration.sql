-- CreateTable
CREATE TABLE "central_banks" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "country_code" VARCHAR(3),
    "region" VARCHAR(50),
    "current_rate" DECIMAL(10,4),
    "neutral_rate" DECIMAL(10,4),
    "last_change_bps" DECIMAL(10,2),
    "last_change_date" DATE,
    "stance" VARCHAR(50),
    "last_updated" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "central_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_actions" (
    "id" UUID NOT NULL,
    "central_bank_id" UUID NOT NULL,
    "action_date" DATE NOT NULL,
    "action_type" VARCHAR(50) NOT NULL,
    "rate_before" DECIMAL(10,4),
    "rate_after" DECIMAL(10,4),
    "change_bps" DECIMAL(10,2),
    "rationale" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_policy_summary" (
    "id" UUID NOT NULL,
    "period" DATE NOT NULL,
    "narrative" TEXT,
    "cuts_count" INTEGER,
    "banks_followed" INTEGER,
    "global_rate_corridor" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_policy_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "central_banks_code_key" ON "central_banks"("code");

-- CreateIndex
CREATE INDEX "idx_central_banks_code" ON "central_banks"("code");

-- CreateIndex
CREATE INDEX "idx_central_banks_country" ON "central_banks"("country_code");

-- CreateIndex
CREATE INDEX "idx_policy_actions_bank" ON "policy_actions"("central_bank_id", "action_date" DESC);

-- CreateIndex
CREATE INDEX "idx_policy_actions_date" ON "policy_actions"("action_date" DESC);

-- CreateIndex
CREATE INDEX "idx_global_policy_summary_period" ON "global_policy_summary"("period" DESC);

-- AddForeignKey
ALTER TABLE "central_banks" ADD CONSTRAINT "central_banks_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_actions" ADD CONSTRAINT "policy_actions_central_bank_id_fkey" FOREIGN KEY ("central_bank_id") REFERENCES "central_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
