import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  transactionOptions: {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 1000,
    timeout: 1200,
  },
  errorFormat: "pretty",
});

export default prisma;
