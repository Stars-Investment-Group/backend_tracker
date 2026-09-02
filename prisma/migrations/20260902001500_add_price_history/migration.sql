-- CreateTable
CREATE TABLE "price_history" (
    "id" UUID NOT NULL,
    "instrument_id" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "open" DECIMAL(20,8),
    "high" DECIMAL(20,8),
    "low" DECIMAL(20,8),
    "close" DECIMAL(20,8) NOT NULL,
    "volume" DECIMAL(20,2),
    "is_adjusted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_price_history_instrument_timestamp" ON "price_history"("instrument_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_price_history_timestamp" ON "price_history"("timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "price_history_instrument_id_timestamp_key" ON "price_history"("instrument_id", "timestamp");

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
