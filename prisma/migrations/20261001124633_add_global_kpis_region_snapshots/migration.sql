-- CreateTable
CREATE TABLE "global_kpis" (
    "id" UUID NOT NULL,
    "kpi_code" VARCHAR(50) NOT NULL,
    "kpi_name" VARCHAR(100) NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "previous_value" DECIMAL(10,4),
    "change" DECIMAL(10,4),
    "change_type" VARCHAR(20),
    "unit" VARCHAR(20),
    "period" DATE NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house_view" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255),
    "narrative" TEXT,
    "outlook" VARCHAR(20),
    "scores" JSONB,
    "region_breakdown" JSONB,
    "period" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "house_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region_snapshots" (
    "id" UUID NOT NULL,
    "region_code" VARCHAR(20) NOT NULL,
    "region_name" VARCHAR(100) NOT NULL,
    "overall_score" DECIMAL(5,2),
    "momentum" VARCHAR(20),
    "risk_score" DECIMAL(5,2),
    "pillar_scores" JSONB,
    "period" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "region_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_kpis_kpi_code_period_key" ON "global_kpis"("kpi_code", "period");

-- CreateIndex
CREATE UNIQUE INDEX "region_snapshots_region_code_period_key" ON "region_snapshots"("region_code", "period");
