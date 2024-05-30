import { Router, Request, Response, NextFunction } from "express";
import { HttpStatus, SuccessResponse } from "../common/utils/reponses";
import WalletService from "./wallet.service";
import { TransactionType } from "./wallet.types";

const router: Router = Router();
const service: WalletService = new WalletService();

router.get(
  "/create",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const wallet = await service.create();

      return SuccessResponse(
        response,
        HttpStatus.CREATED,
        "Wallet created successfully",
        wallet
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/balance/:walletId",
  async ({ params }: Request, response: Response, next: NextFunction) => {
    try {
      const { walletId } = params;
      const wallet = await service.getBalance(walletId);

      return SuccessResponse(
        response,
        HttpStatus.CREATED,
        "Wallet balance queried successfully",
        wallet
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/history/:walletId",
  async ({ params }: Request, response: Response, next: NextFunction) => {
    try {
      const { walletId } = params;
      const history = await service.getHistory(walletId);

      return SuccessResponse(
        response,
        HttpStatus.CREATED,
        "Wallet transaction history returned successfully",
        history
      );
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/debit",
  async ({ body }: Request, response: Response, next: NextFunction) => {
    try {
      const transaction = await service.transfer({
        ...body,
        type: TransactionType.DEBIT,
      });

      return SuccessResponse(
        response,
        HttpStatus.OK,
        "Wallet debit transaction processed.",
        transaction
      );
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/credit",
  async ({ body }: Request, response: Response, next: NextFunction) => {
    try {
      const transaction = await service.transfer({
        ...body,
        type: TransactionType.CREDIT,
      });

      return SuccessResponse(
        response,
        HttpStatus.OK,
        "Wallet credit transaction processed.",
        transaction
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
