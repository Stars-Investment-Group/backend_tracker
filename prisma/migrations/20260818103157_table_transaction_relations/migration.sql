-- CreateEnum
CREATE TYPE "transaction_type_enum" AS ENUM ('buy', 'sell', 'dividend');

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "portfolio_id" UUID NOT NULL,
    "instrument_id" UUID NOT NULL,
    "transaction_type" "transaction_type_enum" NOT NULL,
    "quantity" DECIMAL(20,8) NOT NULL,
    "price" DECIMAL(20,8) NOT NULL,
    "fees" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "transaction_date" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_transactions_portfolio_id" ON "transactions"("portfolio_id");

-- CreateIndex
CREATE INDEX "idx_transactions_instrument_id" ON "transactions"("instrument_id");

-- CreateIndex
CREATE INDEX "idx_transactions_transaction_date" ON "transactions"("transaction_date" DESC);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
