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

export enum responseCode {
  SUCCESS = "00",
  INSUFFICIENT_BALANCE = "02",
  FAILED = "01",
}

export enum responseMessage {
  SUCCESS = "Transaction successful",
  INSUFFICIENT_BALANCE = "Insufficient balance",
  FAILED = "Transaction fialed",
}

export const constant: Record<string, any> = {
  adminWalletId: "2340000000000",
};
