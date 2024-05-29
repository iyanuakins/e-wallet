import { Prisma } from "@prisma/client";

export const cleanAmount = (amount: string | number) => {
  return new Prisma.Decimal(+amount).clamp(2, 2);
};
