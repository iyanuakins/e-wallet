export interface IWallet {
  id: number;
  amount: string;
  walletId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletTransaction {
  walletId: string;
  amount: string;
  type: string;
}

export interface IWalletTransactionResponse {
  responseCode: string;
  responseMessage: string;
  transaction: any;
}

export enum TransactionType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
}

export enum ResponseCode {
  SUCCESS = "00",
  INSUFFICIENT_BALANCE = "02",
  FAILED = "01",
}

export enum ResponseMessage {
  SUCCESS = "Transaction successful",
  INSUFFICIENT_BALANCE = "Insufficient balance",
  FAILED = "Transaction fialed, try again later",
}

export const constant: Record<string, any> = {
  adminWalletId: "1000000000",
};
