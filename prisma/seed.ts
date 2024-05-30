import { Prisma, PrismaClient } from "@prisma/client";
import Logger from "../src/common/config/logger";

const prisma = new PrismaClient({ errorFormat: "pretty" });

const main = async () => {
  try {
    const walletCount = await prisma.wallet.count({
      where: { walletId: "1000000000" },
    });
    if (walletCount > 0) return;

    Logger.info("Seeding admin wallet..,");
    const data: Prisma.WalletCreateInput = {
      walletId: "1000000000",
      balance: 99999999.99,
    };
    await prisma.wallet.create({ data });
  } catch (error) {
    Logger.error("Error occurred while seeding: ", error);
  } finally {
    await prisma.$disconnect();
  }
};

void main();
