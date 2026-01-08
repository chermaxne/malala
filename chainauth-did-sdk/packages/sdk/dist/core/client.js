// client.ts - XRPL Client setup
import { Client } from 'xrpl';
export class XRPLClient {
    constructor(serverUrl) {
        this.client = new Client(serverUrl);
    }
    async connect() {
        if (!this.client.isConnected()) {
            await this.client.connect();
        }
    }
    async disconnect() {
        if (this.client.isConnected()) {
            await this.client.disconnect();
        }
    }
    getClient() {
        return this.client;
    }
    /**
     * Helper to autofill, sign, and submit a transaction, then wait for validation.
     */
    async submitAndWait(transaction, wallet) {
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
//# sourceMappingURL=client.js.map