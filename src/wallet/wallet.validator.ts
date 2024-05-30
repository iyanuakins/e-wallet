import Joi from "joi";
import { IWallet, IWalletTransaction, TransactionType } from "./wallet.types";

const walletTransactionValidationSchema = Joi.object<
  Partial<IWalletTransaction>
>({
  walletId: Joi.string().required().length(10).messages({
    "string.empty": `wallet id cannot be empty.`,
    "string.length": `wallet id length must be 10.`,
    "string.required": "Wallet id is required.",
  }),
  amount: Joi.string()
    .required()
    .pattern(/^(?=.*[1-9])\d*(\.\d+)?$/)
    .messages({
      "string.empty": `Enter a valid amount.`,
      "string.pattern.base": "Enter a valid amount.",
      "string.required": "Amount is required.",
    }),
  type: Joi.string()
    .required()
    .valid(...Object.keys(TransactionType))
    .messages({ "string.required": "Transaction type is required." }),
}).options({ stripUnknown: true });

export const validatewalletTransactionPayload = async (
  payload: IWalletTransaction
) => walletTransactionValidationSchema.validateAsync(payload);
