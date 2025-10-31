-- CreateTable
CREATE TABLE "PairSnapshot" (
    "id" SERIAL NOT NULL,
    "pair" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "liquidity" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PairSnapshot_pkey" PRIMARY KEY ("id")
);
