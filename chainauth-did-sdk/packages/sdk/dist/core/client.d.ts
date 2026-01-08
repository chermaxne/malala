import { Client, Wallet, SubmittableTransaction, TxResponse } from 'xrpl';
export declare class XRPLClient {
    private client;
    constructor(serverUrl: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): Client;
    /**
     * Helper to autofill, sign, and submit a transaction, then wait for validation.
     */
    submitAndWait(transaction: SubmittableTransaction, wallet: Wallet): Promise<TxResponse>;
}
