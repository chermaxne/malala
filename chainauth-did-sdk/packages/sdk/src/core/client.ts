// client.ts - XRPL Client setup
import { Client, Wallet, SubmittableTransaction, TxResponse } from 'xrpl';

export class XRPLClient {
  private client: Client;

  constructor(serverUrl: string) {
    this.client = new Client(serverUrl);
  }

  async connect(): Promise<void> {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isConnected()) {
      await this.client.disconnect();
    }
  }

  getClient(): Client {
    return this.client;
  }

  /**
   * Helper to autofill, sign, and submit a transaction, then wait for validation.
   */
  async submitAndWait(transaction: SubmittableTransaction, wallet: Wallet): Promise<TxResponse> {
    if (!this.client.isConnected()) {
      await this.connect();
    }

    const prepared = await this.client.autofill(transaction);
    const signed = wallet.sign(prepared);
    const result = await this.client.submitAndWait(signed.tx_blob);

    if (result.result.meta && typeof result.result.meta !== 'string') {
      if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`);
      }
    }

    return result;
  }
}
