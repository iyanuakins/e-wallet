import prisma from "./../common/config/prisma";
import Logger from "./../common/config/logger";
import { Prisma } from "@prisma/client";
import { Mutex, MutexInterface, withTimeout } from "async-mutex";
import { cleanAmount } from "../common/utils/helpers";
import HttpException, { HttpExceptionName } from "../common/utils/exceptions";
import { HttpStatus } from "../common/utils/reponses";
import { validatewalletTransactionPayload } from "./wallet.validator";
import {
  IWalletTransaction,
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
      const { id, ...rest } = wallet;
      return rest;
    } catch (error: any) {
      Logger.error("Error occurred while creating wallet: ", error);
      throw new HttpException(
        "An error occurred, try again later",
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpExceptionName.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getBalance(walletId: string) {
    try {
      const wallet = await prisma.wallet.findFirst({
        where: { walletId },
      });

      if (!wallet) {
        Logger.info(`Wallet not found: ${walletId}`);
        throw new HttpException(
          "Balance enquiry wallet not found",
          HttpStatus.NOT_FOUND,
          HttpExceptionName.NOT_FOUND
        );
      }
      const { balance } = wallet;
      Logger.info(
        `Balance enquiry for walletId: ${walletId}, balance: ${balance}`
      );

      return { walletId, balance };
    } catch (error: any) {
      Logger.error("Error occurred while creating wallet: ", error);
      if (typeof error == typeof HttpException) {
        throw error;
      }

      throw new HttpException(
        "An error occurred, try again later",
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpExceptionName.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getHistory(walletId: string) {
    try {
      const wallet = await prisma.wallet.findFirst({
        where: { walletId },
      });

      if (!wallet) {
        Logger.info(`Transaction history wallet not found: ${walletId}`);
        throw new HttpException(
          "Wallet not found",
          HttpStatus.NOT_FOUND,
          HttpExceptionName.NOT_FOUND
        );
      }

      const history = await prisma.transaction.findMany({
        where: { walletId },
      });

      return { walletId, history };
    } catch (error: any) {
      Logger.error("Error occurred while creating wallet: ", error);
      if (typeof error == typeof HttpException) {
        throw error;
      }

      throw new HttpException(
        "An error occurred, try again later",
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpExceptionName.INTERNAL_SERVER_ERROR
      );
    }
  }

  async transfer(
    payload: Record<string, any>
  ): Promise<IWalletTransactionResponse> {
    const { amount, type, walletId } = await validatewalletTransactionPayload(
      payload as IWalletTransaction
    );
    const walletCount = await prisma.wallet.count({
      where: { walletId },
    });
    if (walletCount < 1) {
      Logger.info(`Wallet not found: ${walletId}`);
      throw new HttpException(
        "Transaction processing wallet not found",
        HttpStatus.NOT_FOUND,
        HttpExceptionName.NOT_FOUND
      );
    }
    
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
            decrement: +cleanedAmount,
          },
        },
        where: {
          walletId: sourceWallet,
        },
      });

      const sourceBalanceBefore = cleanAmount(+cleanedAmount + source.balance);

      if (source.balance < 0) {
        Logger.info(
          `Insufficient balance in source wallet: ${sourceWallet}, amount: ${cleanedAmount}, balance: ${sourceBalanceBefore}`
        );
        if (!isCreditTransaction) {
          return {
            responseCode: responseCode.INSUFFICIENT_BALANCE,
            responseMessage: responseMessage.INSUFFICIENT_BALANCE,
            transaction: payload,
          };
        }
        return {
          responseCode: responseCode.FAILED,
          responseMessage: responseMessage.FAILED,
          transaction: payload,
        };
      }

      Logger.info(
        `${cleanedAmount} debited form source wallet:${sourceWallet}`
      );
      const reference = `EW-${Date.now()}`;

      const transactionInputs: Prisma.TransactionCreateInput[] = [
        {
          walletId: sourceWallet,
          amount: +cleanedAmount,
          balanceBefore: +sourceBalanceBefore,
          balanceAfter: source.balance,
          reference: `${reference}-01`,
          type: "DEBIT",
        },
      ];

      const destination = await trx.wallet.update({
        data: {
          balance: {
            increment: +cleanedAmount,
          },
        },
        where: {
          walletId: destinationWallet,
        },
      });

      Logger.info(
        `${cleanedAmount} credited to destination wallet:${sourceWallet}`
      );
      const destinationBalanceBefore = cleanAmount(
        destination.balance - +cleanedAmount
      );

      transactionInputs.push({
        walletId: destinationWallet,
        amount: +cleanedAmount,
        balanceBefore: +destinationBalanceBefore,
        balanceAfter: destination.balance,
        reference: `${reference}-02`,
        type: "CREDIT",
      });

      const [debiTransactions, creditTransaction] =
        (await trx.transaction.createManyAndReturn({
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
      console.log(typeof error as string);
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
