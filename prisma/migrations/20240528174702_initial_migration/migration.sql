-- CreateTable
CREATE TABLE "Wallet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "walletId" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0.00,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "walletId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL DEFAULT 0.00,
    "balanceBefore" DECIMAL NOT NULL DEFAULT 0.00,
    "balanceAfter" DECIMAL NOT NULL DEFAULT 0.00,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_walletId_key" ON "Wallet"("walletId");
