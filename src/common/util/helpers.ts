import { Prisma } from "@prisma/client";

export const cleanAmount = (amount: string | number) => {
  return parseFloat(amount.toString()).toFixed(2);
};
