import Joi from "joi";
import { IWallet, IWalletTransaction, TransactionType } from "./wallet.types";

const walletTransactionValidationSchema = Joi.object<
  Partial<IWalletTransaction>
>({
  walletId: Joi.string()
    .required()
    .length(10)
    .messages({ "any.only": "Invalid Wallet number." }),
  amount: Joi.string()
    .required()
    .pattern(/^(?=.*[1-9])\d*(\.\d+)?$/)
    .messages({ "any.only": "Invalid amount." }),
  type: Joi.string()
    .required()
    .valid(...Object.keys(TransactionType))
    .messages({ "any.only": "Invalid transaction type." }),
}).options({ stripUnknown: true });

export const validatewalletTransactionPayload = async (
  payload: IWalletTransaction
) => walletTransactionValidationSchema.validateAsync(payload);
