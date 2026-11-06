-- CreateTable
CREATE TABLE "alerts_macro" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "country_code" VARCHAR(3),
    "region" VARCHAR(50),
    "source_module" VARCHAR(50),
    "source_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "triggered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_macro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_reads" (
    "user_id" UUID NOT NULL,
    "alert_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_reads_pkey" PRIMARY KEY ("user_id","alert_id")
);

-- CreateTable
CREATE TABLE "alert_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category" VARCHAR(50),
    "country_code" VARCHAR(3),
    "min_severity" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_alerts_macro_category" ON "alerts_macro"("category");

-- CreateIndex
CREATE INDEX "idx_alerts_macro_severity" ON "alerts_macro"("severity");

-- CreateIndex
CREATE INDEX "idx_alerts_macro_country" ON "alerts_macro"("country_code");

-- CreateIndex
CREATE INDEX "idx_alerts_macro_triggered" ON "alerts_macro"("triggered_at" DESC);

-- CreateIndex
CREATE INDEX "idx_alerts_macro_active" ON "alerts_macro"("is_active");

-- CreateIndex
CREATE INDEX "idx_alert_reads_alert" ON "alert_reads"("alert_id");

-- CreateIndex
CREATE INDEX "idx_alert_subscriptions_user" ON "alert_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "idx_alert_subscriptions_active" ON "alert_subscriptions"("is_active");

-- AddForeignKey
ALTER TABLE "alerts_macro" ADD CONSTRAINT "alerts_macro_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_reads" ADD CONSTRAINT "alert_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_reads" ADD CONSTRAINT "alert_reads_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts_macro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_subscriptions" ADD CONSTRAINT "alert_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
