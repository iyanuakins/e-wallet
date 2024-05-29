import prisma from "./../common/config/prisma";
import Logger from "./../common/config/logger";
import { Prisma } from "@prisma/client";
import { Mutex, MutexInterface, withTimeout } from "async-mutex";
import { cleanAmount } from "../common/utils/decimal";
import HttpException from "../common/utils/exceptions";
import { HttpStatus } from "../common/utils/reponses";
import { validatewalletTransactionPayload } from "./wallet.validator";
import {
  IWalletTransactionResponse,
  TransactionType,
  constant,
  responseCode,
  responseMessage,
} from "./wallet.types";

export default class WalletService {
  private mutexWithTimeout: MutexInterface | undefined;
  constructor() {
    this.mutexWithTimeout = withTimeout(
      new Mutex(),
      1000,
      new Error("Mutex timed out.")
    );
  }

  private generateWallet() {
    const walletId = `100${Math.floor(Math.random() * 9999999)}`;
    Logger.info(`Genarated wallet id: ${walletId}`);
    return walletId;
  }

  async create() {
    try {
      let walletId: string = "";
      let walletCount: number = 0;
      do {
        walletId = this.generateWallet();
        walletCount = await prisma.wallet.count({
          where: { walletId },
        });
      } while (walletCount > 0);

      Logger.info(`creating wallet: ${walletId}`);

      const wallet = await prisma.wallet.create({
        data: { walletId },
      });
      Logger.info(`created wallet: ${JSON.stringify(wallet)}`);

      return wallet;
    } catch (error: any) {
      Logger.error("Error occurred while creating wallet: ", error);
    }
  }

  async transfer(payload: any): Promise<IWalletTransactionResponse> {
    const { amount, type, walletId } = await validatewalletTransactionPayload(
      payload
    );
    const isCreditTransaction = type === TransactionType.CREDIT;
    const sourceWallet = isCreditTransaction
      ? constant.adminWalletId
      : walletId;
    const destinationWallet = isCreditTransaction
      ? walletId
      : constant.adminWalletId;
    const cleanedAmount = cleanAmount(amount!);

    Logger.info(
      `Starting transfer of ${cleanedAmount} from ${sourceWallet} to ${destinationWallet}`
    );

    const transaction = async (trx: any) => {
      const source = await trx.wallet.update({
        data: {
          balance: {
            decrement: cleanedAmount,
          },
        },
        where: {
          walletId: sourceWallet,
        },
      });

      const sourceBalanceBefore = cleanedAmount.add(
        cleanAmount(source.balance)
      );

      if (source.balance < 0) {
        Logger.info(
          `Insufficient balance in source wallet: ${sourceWallet}, amount: ${cleanAmount}, balance: ${sourceBalanceBefore}`
        );
        return {
          responseCode: responseCode.INSUFFICIENT_BALANCE,
          responseMessage: responseMessage.INSUFFICIENT_BALANCE,
          transaction: payload,
        };
      }

      Logger.info(
        `${cleanedAmount} debited form source wallet:${sourceWallet}`
      );
      const reference = `EW-${Date.now}`;

      const transactionInputs: Prisma.TransactionCreateInput[] = [
        {
          walletId: sourceWallet,
          amount: cleanedAmount,
          balanceBefore: sourceBalanceBefore,
          balanceAfter: source.balance,
          reference: `${reference}-01`,
          type: "DEBIT",
        },
      ];

      const destination = await trx.wallet.update({
        data: {
          balance: {
            increment: cleanedAmount,
          },
        },
        where: {
          walletId: destinationWallet,
        },
      });

      Logger.info(
        `${cleanedAmount} credited to destination wallet:${sourceWallet}`
      );
      const destinationBalanceBefore = cleanAmount(destination.balance).sub(
        cleanedAmount
      );

      transactionInputs.push({
        walletId: destinationWallet,
        amount: cleanedAmount,
        balanceBefore: destinationBalanceBefore,
        balanceAfter: destination.balance,
        reference: `${reference}-02`,
        type: "CREDIT",
      });

      const [debiTransactions, creditTransaction] =
        (await trx.Transaction.createMany({
          data: transactionInputs,
        })) || [{}, {}];

      Logger.info(
        `Completed transfer of ${cleanedAmount} from ${sourceWallet} to ${destinationWallet}
        ${JSON.stringify({ debiTransactions, creditTransaction })}`
      );

      return {
        responseCode: responseCode.SUCCESS,
        responseMessage: responseMessage.SUCCESS,
        transaction: isCreditTransaction ? creditTransaction : debiTransactions,
      };
    };

    try {
      return await this.mutexWithTimeout!.runExclusive(() =>
        prisma.$transaction(transaction)
      );
    } catch (error: any) {
      Logger.error("Error occurred while processing transaction: ", error);
      if (typeof error == typeof HttpException) {
        throw error;
      }

      return {
        responseCode: responseCode.FAILED,
        responseMessage: responseMessage.FAILED,
        transaction: payload,
      };
    }
  }
}
