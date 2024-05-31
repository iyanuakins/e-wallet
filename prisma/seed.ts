import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

const main = async () => {
  try {
    console.log("Checking for admin wallet...");
    const walletCount = await prisma.wallet.count({
      where: { walletId: "1000000000" },
    });
    if (walletCount > 0) return;

    console.log("Seeding admin wallet...");
    const data: Prisma.WalletCreateInput = {
      walletId: "1000000000",
      balance: 99999999.99,
    };
    await prisma.wallet.create({ data });
  } catch (error) {
    console.error("Error occurred while seeding: ", error);
  } finally {
    await prisma.$disconnect();
  }
};

void main();
