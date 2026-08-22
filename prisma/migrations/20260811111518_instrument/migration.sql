-- CreateTable
CREATE TABLE "Instrument" (
    "id" UUID NOT NULL,
    "ticker" VARCHAR(50),
    "name" VARCHAR(255) NOT NULL,
    "assetClass" VARCHAR(50) NOT NULL,
    "sector" VARCHAR(100),
    "industry" VARCHAR(100),
    "exchange" VARCHAR(50),
    "country" VARCHAR(3),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "isin" VARCHAR(12),
    "cusip" VARCHAR(9),
    "sedol" VARCHAR(7),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);
